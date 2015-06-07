import _ from 'lodash';
import jsonpatch from 'fast-json-patch';

import printCurrentStateOfTheApplication from '../core/utils/printCurrentStateOfTheApplication';
import Denormalizer from '../core/denormalizers/Denormalizer';
import documentStore from '../documentStore';
import reportNotFound from '../core/utils/reportNotFound';

let databaseCollectionName = 'ProductDetailsReports';

// TODO: Rename to Denormalizer instead of ReportAggregator
export default class ProductDetailsReportAggregator extends Denormalizer {
  constructor(io) {
    super();
    this.io = io;
  }

  emitMessage(event, callback) {
    console.log(` -- socket.io sending event ${event.eventName} for ${event.payload.id} to client`.green);

    printCurrentStateOfTheApplication();

    // // The following event format is used by angular.CQRS module
    // this.io.sockets.emit('events', {
    //   name: event.eventName,
    //   aggregateType: 'product',
    //   id: event.eventId,
    //   aggregateRootId: event.aggregateRootId,
    //   commandId: null, // TODO: Include id of command that initiated this event
    //   version: event.eventVersion,
    //   created: event.created,
    //   meta: event.meta, // Includes username, needs more work
    //   payload: event.payload,
    //   patch: event.patch
    // });
    callback();
  }

  handleProductCreated(event, callback) {
    let productDetailsReport = _.defaults({
      id: event.aggregateRootId,
      published: false
    }, event.payload);
    // let productDetailsReport = {
    //   id: event.aggregateRootId,
    //   name: event.payload.name,
    //   pathName: event.payload.pathName,
    //   renderPath: event.payload.renderPath,
    //   published: false
    // };
    documentStore.insertReport(databaseCollectionName, productDetailsReport, callback);
  }
  handleProductRenamed(event, callback) {
    documentStore.getReport(databaseCollectionName, event.aggregateRootId,
      (error, productDetailsReport) => {
        if(error)
          return callback(error);

        if(!productDetailsReport)
          return reportNotFound(event.aggregateRootId, callback);

        let observer = jsonpatch.observe( productDetailsReport );
        productDetailsReport.name = event.payload.name;
        event.patch = jsonpatch.generate(observer);

        callback();
      }
    );
  }
  handleProductPathNameUpdated(event, callback) {
    documentStore.getReport(databaseCollectionName, event.aggregateRootId,
      (error, productDetailsReport) => {
        if(error)
          return callback(error);

        if(!productDetailsReport)
          return reportNotFound(event.aggregateRootId, callback);

        let observer = jsonpatch.observe( productDetailsReport );
        productDetailsReport.pathName = event.payload.pathName;
        event.patch = jsonpatch.generate(observer);

        callback();
      }
    );
  }
  handleProductRenderPathUpdated(event, callback) {
    documentStore.getReport(databaseCollectionName, event.aggregateRootId,
      (error, productDetailsReport) => {
        if(error)
          return callback(error);

        if(!productDetailsReport)
          return reportNotFound(event.aggregateRootId, callback);

        let observer = jsonpatch.observe( productDetailsReport );
        productDetailsReport.renderPath = event.payload.renderPath;
        event.patch = jsonpatch.generate(observer);

        callback();
      }
    );
  }
  handleProductTraitColorUpdated(event, callback) {
    documentStore.getReport(databaseCollectionName, event.aggregateRootId,
      (error, productDetailsReport) => {
        if(error)
          return callback(error);

        if(!productDetailsReport)
          return reportNotFound(event.aggregateRootId, callback);

        let observer = jsonpatch.observe( productDetailsReport );
        var trait = _.find(productDetailsReport.traits, {id: event.payload.trait });
        if (trait) {
          trait.visualization = trait.visualization || {};
          trait.visualization.color = event.payload.color;
        }
        event.patch = jsonpatch.generate(observer);

        callback();
      }
    );
  }
  handleProductPublished(event, callback) {
    documentStore.getReport(databaseCollectionName, event.aggregateRootId,
      (error, productDetailsReport) => {
        if(error)
          return callback(error);

        if(!productDetailsReport)
          return reportNotFound(event.aggregateRootId, callback);

        let observer = jsonpatch.observe( productDetailsReport );
        productDetailsReport.published = true;
        event.patch = jsonpatch.generate(observer);

        callback();
      }
    );
  }
  handleProductUnpublished(event, callback) {
    documentStore.getReport(databaseCollectionName, event.aggregateRootId,
      (error, productDetailsReport) => {
        if(error)
          return callback(error);

        if(!productDetailsReport)
          return reportNotFound(event.aggregateRootId, callback);

        let observer = jsonpatch.observe( productDetailsReport );
        productDetailsReport.published = false;
        event.patch = jsonpatch.generate(observer);

        callback();
      }
    );
  }
  handleProductRemoved(event, callback) {
    documentStore.removeReport(databaseCollectionName, event.aggregateRootId, callback);
  }
}

