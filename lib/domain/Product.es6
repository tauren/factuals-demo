import _ from 'lodash';

import AggregateRoot from '../core/domain/AggregateRoot';
import { InvalidOperationError } from '../core/errors';
import handlers from './domainEventHandlers';

export default class Product extends AggregateRoot {

  static create(id, props) {
    return new Product(id, props);
  }

  constructor(id, props) {
    super(id);
    this.published = false;
    this.removed = false;
    this.name = '';
    this.pathName = '';
    this.renderPath = '';

    this.images = {};
    this.views = {};
    this.bomComponents = [];
    this.groups = [];
    this.traits = [];
    this.palettes = [];
    this.stylecolors = [];
    this.prebuilds = [];

    this.subscribeToDomainEvents(this);

    // Props should not be passed when a new Product is being rehydrated from
    // the EventStore. The following code should only run when processing the
    // CreateProduct command, not when rehydrating the model.
    if(props && props.name) {
      this.apply('ProductCreated', props);
      // TODO: node_m_r passes each each property individually, but I
      // changed it to send the whole object since for the POC I'm loading
      // the full janMax1504 model
      // this.apply('ProductCreated', {
      //   name,
      //   pathName,
      //   renderPath
      // });
    }
  }

  subscribeToDomainEvents() {
    this.onEvent('ProductCreated', handlers.ProductCreated);
    this.onEvent('ProductRenamed', handlers.ProductRenamed);
    this.onEvent('ProductPathNameUpdated', handlers.ProductPathNameUpdated);
    this.onEvent('ProductRenderPathUpdated', handlers.ProductRenderPathUpdated);

    this.onEvent('ProductTraitColorUpdated', (productTraitColorUpdated) => {
      var trait = _.find(this.traits, {id: productTraitColorUpdated.payload.trait });
      // TODO: Should we not do the existence check here?
      if (trait) {
        // NOTE: Event handlers should NOT have any branches
        // We've already checked to make sure the trait exists in the command handler,
        // so should we not do the existence check here? However, we don't want to
        // crash the server, so adding this protection may be a good thing.
        trait.visualization = trait.visualization || {};
        trait.visualization.color = productTraitColorUpdated.payload.color;
      }
    });

    this.onEvent('ProductPublished', (productPublished) => {
      this.published = true;
    });

    this.onEvent('ProductUnpublished', (productUnpublished) => {
      // The following line was the original implementation before ProductUnpublishedV2
      // was added to the system
      this.published = false;

      // The following line was added when ProductUnpliblishedV2 event was added to system.
      //
      // Convert old events to new events
      //
      // Domain models evolve over time, but events in the EventStore should never change.
      // We must be able to apply old events when hydrating a new model. When a new event
      // is introduced, we may need to add conversion code to old events. Note that we can
      // support clients that expect the old model as well as clients that expect the new
      // at the same time by providing convertion from new to old as well as old to new.
      this.unpublishReason = 'Before model contained reason for unpublishing product';
    });

    this.onEvent('ProductUnpublishedV2', (productUnpublishedV2) => {
      this.published = false;

      // At some point after initial launch, business decided they want to record a
      // reason for why a product was unpublished. To accommodate, a new version of the
      // ProductUnpublished event is created and the domain model is updated to
      // include a reason for unpublishing.
      this.unpublishReason = productUnpublishedV2.unpublishReason;
    });

    this.onEvent('ProductRemoved', (productRemoved) => {
      this.removed = true;
    });

  }

  rename(name) {
    // Validation and business logic takes place here
    // Should NOT update model properties in this method
    if (!name || typeof name !== 'string' || !name.length) {
      var errorMesage = 'Name must be a string of one or more characters';
      throw new InvalidOperationError(errorMesage);
    }
    // Create event and emit. This event is then processed by the event handler
    // registered above. That event handler takes care of updating model
    // properties. This design allows events to be replayed at a later date on
    // an emtpy model instance to rehydrate the model.
    this.apply('ProductRenamed', {
      name
    });
  }

  updatePathName(pathName) {
    if (!pathName || typeof pathName !== 'string' || !pathName.length) {
      var errorMesage = 'Path name must be a string of one or more characters';
      throw new InvalidOperationError(errorMesage);
    }
    this.apply('ProductPathNameUpdated', {
      pathName
    });
  }

  updateRenderPath(renderPath) {
    if (!renderPath || typeof renderPath !== 'string' || !renderPath.length) {
      var errorMesage = 'Render path must be a string of one or more characters';
      throw new InvalidOperationError(errorMesage);
    }
    this.apply('ProductRenderPathUpdated', {
      renderPath
    });
  }

  updateTraitColor(traitId, color) {
    var errorMesage;
    if (!traitId || typeof traitId !== 'string' || !traitId.length) {
      errorMesage = 'Trait id must be a string of one or more characters';
      throw new InvalidOperationError(errorMesage);
    }
    var trait = _.find(this.traits, {id: traitId});
    if (!trait) {
      errorMesage = 'Trait id is not in product';
      throw new InvalidOperationError(errorMesage);
    }
    this.apply('ProductTraitColorUpdated', {
      trait: traitId,
      color
    });
  }

  publish() {
    if (this.published) {
      var errorMesage = 'This product is already published';
      throw new InvalidOperationError(errorMesage);
    }
    this.apply('ProductPublished', {});
  }

  unpublish() {
    if (!this.published) {
      var errorMesage = 'This product is currently unpublished';
      throw new InvalidOperationError(errorMesage);
    }
    this.apply('ProductUnpublished', {});
  }

  remove() {
    if (this.published) {
      var errorMesage = 'This product is currently published and cannot be removed';
      throw new InvalidOperationError(errorMesage);
    }
    if (this.removed) {
      var errorMesage = 'This product is already removed';
      throw new InvalidOperationError(errorMesage);
    }
    this.apply('ProductRemoved', {});
  }

}
