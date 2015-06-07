import socketio from 'socket.io';
import uuidGenerator from 'node-uuid';
import _ from 'lodash';
import colors from 'colors';

import printCurrentStateOfTheApplication from './core/utils/printCurrentStateOfTheApplication';
import bootstrap from './bootstrapper';
// import products from '../services/products';
import commandBus from './commandBus';
import socketBus from './socketBus';

let timeout = 1000;

function errorHandler(error) {
  if(error) {
    console.log(('ERROR: '+ (typeof error === 'string' ? error.red : error.message)).red);
    return;
  }
  // Log current EventStore and DocumentStore state
  printCurrentStateOfTheApplication();
}

function createProduct(productId) {
  products.load(
    productId,
    function(err, product) {
      if (err) {
        console.log('error', err);
        return;
      }
      var command = {
        id: uuidGenerator.v1(),
        command: 'CreateProduct',
        aggregateType: 'product',
        payload: product
      };
      console.log(` -- issuing ${command.command} command for ${command.payload.id}`.blue);
      commandBus.publish(command);
      _.delay(printCurrentStateOfTheApplication, timeout/2);
    }
  );
}

export default class IOServer {

  static create(server) {
    return new IOServer(server);
  }

  constructor(server) {

    // Start socket.io server
    this.io = socketio.listen(server);

    // Create Denormalizers and register Denormalizer event handlers
    bootstrap(this.io);

    // TODO: Remove these bootstrapped CreateProduct commands (temporary hack)
    // Bootstrap eventStore with janMax product
    // createProduct('janMax1504');

    // Delay, then bootstrap eventStore with LBJ product
    // _.delay(createProduct, timeout, 'LBJEliteSock1504');

    // Setup communication channels
    this.io.on('connection', function(socket) {
      console.log(' -- socket.io connection established'.green);
      socket.on('commands', function(data) {
        console.log(` -- socket.io received command ${data.command} for ${data.payload.id}`.green);

        // Emit to commandBus
        commandBus.publish(data);
      });
    });
  }

  getIO() {
    return this.io;
  }
}

