import _ from 'lodash';
import jsonpatch from 'fast-json-patch';

import printCurrentStateOfTheApplication from '../core/utils/printCurrentStateOfTheApplication';
import Denormalizer from '../core/denormalizers/Denormalizer';
import documentStore from '../documentStore';
import reportNotFound from '../core/utils/reportNotFound';

let databaseCollectionName = 'ProductHeaderViewModels';

export default class ProductHeaderDenormalizer extends Denormalizer {
  constructor(io) {
    super();
    this.io = io;
  }

  emitMessage(event, callback) {
    console.log(` -- socket.io sending event ${event.eventName} for ${event.payload.id} to client`.green);

    printCurrentStateOfTheApplication();

    // The following event format is used by angular.CQRS module
    this.io.sockets.emit('events', {
      name: event.eventName,
      aggregateType: 'productHeaderViewModel',
      id: event.eventId,
      aggregateRootId: event.aggregateRootId,
      commandId: null, // TODO: Include id of command that initiated this event
      version: event.eventVersion,
      created: event.created,
      meta: event.meta, // Includes username, needs more work
      payload: event.payload,
      patch: event.patch
    });
    callback();
  }

  handleProductCreated(event, callback) {
    let productHeaderViewModel = {
      id: event.aggregateRootId,
      name: event.payload.name,
      pathName: event.payload.pathName,
      renderPath: event.payload.renderPath,
      views: event.payload.views
    };
    documentStore.insertReport(databaseCollectionName, productHeaderViewModel, callback);
  }
  handleProductRenamed(event, callback) {
    documentStore.getReport(databaseCollectionName, event.aggregateRootId,
      (error, productHeaderViewModel) => {
        if(error)
          return callback(error);

        if(!productHeaderViewModel)
          return reportNotFound(event.aggregateRootId, callback);

        let observer = jsonpatch.observe( productHeaderViewModel );
        productHeaderViewModel.name = event.payload.name;
        event.patch = jsonpatch.generate(observer);

        callback();
      }
    );
  }
  handleProductPathNameUpdated(event, callback) {
    documentStore.getReport(databaseCollectionName, event.aggregateRootId,
      (error, productHeaderViewModel) => {
        if(error)
          return callback(error);

        if(!productHeaderViewModel)
          return reportNotFound(event.aggregateRootId, callback);

        let observer = jsonpatch.observe( productHeaderViewModel );
        productHeaderViewModel.pathName = event.payload.pathName;
        event.patch = jsonpatch.generate(observer);

        callback();
      }
    );
  }
  handleProductRenderPathUpdated(event, callback) {
    documentStore.getReport(databaseCollectionName, event.aggregateRootId,
      (error, productHeaderViewModel) => {
        if(error)
          return callback(error);

        if(!productHeaderViewModel)
          return reportNotFound(event.aggregateRootId, callback);

        let observer = jsonpatch.observe( productHeaderViewModel );
        productHeaderViewModel.renderPath = event.payload.renderPath;
        event.patch = jsonpatch.generate(observer);

        callback();
      }
    );
  }
  handleProductRemoved(event, callback) {
    documentStore.removeReport(databaseCollectionName, event.aggregateRootId, callback);
  }
}

