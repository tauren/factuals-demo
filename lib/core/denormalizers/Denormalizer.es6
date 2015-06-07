// ES6 implementation of node_m_r

import stream from 'stream';
import dummyHandler from '../utils/dummyHandler';

// Referred to as a ReportAggregator by node_m_r
export default class Denormalizer extends stream.Writable {
  constructor() {
    super({ objectMode: true });
  }
  _write(domainEvent, encoding, next) {
    let eventHandlerName = 'handle' + domainEvent.eventName;
    let eventHandler = this[eventHandlerName] || dummyHandler;
    eventHandler.call(this, domainEvent, error => {
      if(error) {
        console.log(error);
        return;
      }
      // Certain denormalizers should emit messages back to client
      if (this.emitMessage) {
        this.emitMessage.call(this, domainEvent, next);
      }
      else {
        next();
      }
    });
  }
}
