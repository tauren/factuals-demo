import eventBus from './eventBus';
import commandBus from './commandBus';
import socketBus from './socketBus';
import PublishedProductsReportAggregator from './denormalizers/PublishedProductsReportAggregator';
import ProductDetailsReportAggregator from './denormalizers/ProductDetailsReportAggregator';
import ProductHeaderDenormalizer from './denormalizers/ProductHeaderDenormalizer';
// import ProductDetailsSocketAggregator from './denormalizers/ProductDetailsSocketAggregator';
import ProductCommandHandlers from './commandHandlers/productCommandHandlers';

export default function bootstrap(io) {
  // Create instances of command handlers
  let productCommandHandlers = new ProductCommandHandlers();

  // Create instances of event handlers
  let publishedProductsReportAggregator = new PublishedProductsReportAggregator(io);
  let productDetailsReportAggregator = new ProductDetailsReportAggregator(io);
  let productHeaderDenormalizer = new ProductHeaderDenormalizer(io);
  // let productDetailsSocketAggregator = new ProductDetailsSocketAggregator(io);

  // Register command handlers in CommandBus
  commandBus.registerHandler(productCommandHandlers);

  socketBus.registerHandler(function(message, callback) {
    io.sockets.emit('events', message);
    callback();
  });

  // Register event handlers in EventBus
  eventBus.registerHandler(publishedProductsReportAggregator);
  eventBus.registerHandler(productDetailsReportAggregator);
  eventBus.registerHandler(productHeaderDenormalizer);
  // eventBus.registerHandler(productDetailsSocketAggregator);
}
