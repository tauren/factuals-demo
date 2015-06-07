import Denormalizer from '../core/denormalizers/Denormalizer';
import documentStore from '../documentStore';
import reportNotFound from '../core/utils/reportNotFound';

let databaseCollectionName = 'PublishedProductsReports';

// TODO: Currently storing both published and unpublished products with a published flag.
//
// Ideally, the document store for this denormalizer would only contain products
// that have been published. The only properties we care about for this report is the
// productId and the name. There should be no need to include the `published: true`
// property. We don't want to listen to ProductCreated events, only to ProductPublished,
// ProductRenamed, and ProductUnpublished. However, if we don't listen to ProductCreated
// events, then in handleProductPublished, documentStore.getReport() will fail since
// it cannot find the product to publish.
//
// One solution would be to query the ProductRepository to rehydrate the product from
// the EventStore. This adds a dependency between the read layer and the write layer,
// but I'm not sure if that is a problem. Need to research more on how to handle
// situations like this.
//
// TODO: Rename to Denormalizer instead of ReportAggregator
export default class PublishedProductsReportAggregator extends Denormalizer {
  constructor(io) {
    super();
    this.io = io;
  }
  // TODO: Is there a way to not need this handler? Instead, insertReport should happen
  // on ProductPublished event, but if we do that no details about the product name exist.
  handleProductCreated(event, callback) {
    let productReport = {
      id: event.aggregateRootId,
      name: event.payload.name,
      published: false
    };
    documentStore.insertReport(databaseCollectionName, productReport, callback);
  }
  // TODO: How can we insertReport on this event? If we do so, no details about product
  // name exist. Perhaps this needs to query the ProductRepository to reconstruct
  // the current product state?
  handleProductPublished(event, callback) {
    documentStore.getReport(databaseCollectionName, event.aggregateRootId,
      (error, productReport) => {
        if(error)
          return callback(error);

        if(!productReport) {

          // TODO: Remove this
          return reportNotFound(event.aggregateRootId, callback);

          // TODO: Add this
          // // Lookup product from ProductRepository
          // productRepository.get(event.aggregateRootId, function(product) {
          //   // Create productReport from product data
          //   // Extract name from product loaded from ProductRepository
          //   productReport = {
          //     id: event.aggregateRootId,
          //     name: product.name
          //   };
          // });

          // TODO: Do we need to execute callback?
          // return callback();
        }

        // No need to save in this POC as the data is in memory
        productReport.published = true;

        // TODO: Add this
        // Insert document into documentStore
        // documentStore.insertReport(databaseCollectionName, productReport, callback);

        callback();
      }
    );
  }
  handleProductUnpublished(event, callback) {
    documentStore.getReport(databaseCollectionName, event.aggregateRootId,
      (error, productReport) => {
        if(error)
          return callback(error);

        if(!productReport) {
          return reportNotFound(event.aggregateRootId, callback);
          // Ignore, since this event could happen before product is published
          // return callback();
        }

        // No need to save in this POC as the data is in memory
        productReport.published = false;
        callback();
      }
    );

    // TODO: Want to removeReport on this event instead of finding existing report.
    // documentStore.removeReport(databaseCollectionName, event.aggregateRootId, callback);
  }
  handleProductRenamed(event, callback) {
    documentStore.getReport(databaseCollectionName, event.aggregateRootId,
      (error, productReport) => {
        if(error)
          return callback(error);

        if(!productReport) {
          return reportNotFound(event.aggregateRootId, callback);
          // Ignore, since this event could happen before product is published
          // return callback();
        }

        // No need to save in this POC as the data is in memory
        productReport.name = event.payload.name;
        callback();
      }
    );
  }
  handleProductRemoved(event, callback) {
    documentStore.removeReport(databaseCollectionName, event.aggregateRootId, callback);
  }
};
