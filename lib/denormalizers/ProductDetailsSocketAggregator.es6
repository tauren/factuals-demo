import Denormalizer from '../core/denormalizers/Denormalizer';
import documentStore from '../documentStore';
import reportNotFound from '../core/utils/reportNotFound';

let databaseCollectionName = 'ProductDetailsReports';

// This denormalizer is a quick hack to listen to all events and resend
// them to the client. The client would need to be able to apply this
// event to all of the various viewmodels it has loaded.
//
// A better solution may be to have the viewmodel denormalizers
// process events and upon success, resend them to a SocketBut. The
// IOServer would listen to the socket bus and emit them to the client.
// However, with this approach, a single event on the MessageBus may be
// emitted to the client multiple times in different formats for each
// viewmodel.
//
// TODO: Rename to Denormalizer instead of ReportAggregator
export default class ProductDetailsSocketAggregator extends Denormalizer {
  constructor(io) {
    super();
    this.io = io;
  }

  // Sample Event received by client
  // {
  //   aggregateRootId: "janMax1504",
  //   aggregateType: "product",
  //   commandId: null,
  //   created: "2015-05-14T00:07:22.570Z",
  //   id: "31b7d2a0-f9cd-11e4-a6da-a125bddb380b",
  //   meta: {
  //     username: "tmil11"
  //   },
  //   name: "ProductRenamed",
  //   payload: {
  //     id: "janMax1504",
  //     name: "STEFAN JANOSKI MAX"
  //   },
  //   version: 2
  // }

  emitMessage(event, callback) {
    console.log(` -- socket.io sending event ${event.eventName} for ${event.payload.id} to client`.green);
    // The following event format is used by angular.CQRS module
    this.io.sockets.emit('events', {
      name: event.eventName,
      aggregateType: 'product',
      id: event.eventId,
      aggregateRootId: event.aggregateRootId,
      commandId: null, // TODO: Include id of command that initiated this event
      version: event.eventVersion,
      created: event.created,
      meta: event.meta, // Includes username, needs more work
      payload: event.payload
    });
    callback();
  }

  handleProductCreated(event, callback) {
    this.emitMessage(event, callback);
  }
  handleProductRenamed(event, callback) {
    this.emitMessage(event, callback);
  }
  handleProductPathNameUpdated(event, callback) {
    this.emitMessage(event, callback);
  }
  handleProductRenderPathUpdated(event, callback) {
    this.emitMessage(event, callback);
  }
  handleProductTraitColorUpdated(event, callback) {
    this.emitMessage(event, callback);
  }
  handleProductPublished(event, callback) {
    this.emitMessage(event, callback);
  }
  handleProductUnpublished(event, callback) {
    this.emitMessage(event, callback);
  }
  handleProductRemoved(event, callback) {
    this.emitMessage(event, callback);
  }
}

