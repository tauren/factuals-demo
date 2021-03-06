// ES6 implementation of node_m_r

import stream from 'stream';
import _ from 'lodash';
import { ConcurrencyViolationError } from '../errors';
import simulateAsynchronousIO from '../utils/simulateAsynchronousIO';
// import couchbaseStore from '../../../stores/couchbase';

// let bucket = couchbaseStore.buckets.products;

let singleton = Symbol();
let singletonEnforcer = Symbol()

export default class EventStore {

  static get instance() {
    if (!this[singleton]) {
      this[singleton] = new EventStore(singletonEnforcer);
    }
    return this[singleton];
  }

  constructor(enforcer) {
    if (enforcer != singletonEnforcer) {
      throw "Cannot construct singleton";
    }
    this.documents = [];
  }

  findStoredDomainEvents(aggregateRootId, callback) {
    // Helps simulate using a real database instead of in-memory storage
    simulateAsynchronousIO(() => {
      let storedDocument = _.find(this.documents, (document) => {
        return document.id === aggregateRootId;
      });
      // Cannot callback with error here or creating new document won't work
      // if (!storedDocument) {
      //   return callback('No events found for '+aggregateRootId)
      // }
      callback(null, storedDocument);
    });
  }

  createDump() {
    return this.documents;
  }

  getAllEventsFor(aggregateRootId, callback) {
    this.findStoredDomainEvents(aggregateRootId, (error, storedDocument) => {
      let eventStream;

      if(error)
        return callback(error);

      if(!storedDocument)
        return callback('No events found for '+aggregateRootId);

      eventStream = new stream.PassThrough({ objectMode: true });

      storedDocument.events.forEach(function(domainEvent) {
        eventStream.write(domainEvent);
      });

      eventStream.end();
      callback(null, eventStream);
    });
  }
  save(domainEvents, aggregateRootId, expectedAggregateRootVersion, callback) {
    this.findStoredDomainEvents(aggregateRootId, (error, storedDocument) => {
      let concurrencyViolation;

      if(error)
        return callback(error);

      if(!storedDocument) {
        storedDocument = {
          id: aggregateRootId,
          events: domainEvents
        };

        this.documents.push(storedDocument);
        return callback();
      }

      if(_.last(storedDocument.events).eventVersion !== expectedAggregateRootVersion) {
        concurrencyViolation = new ConcurrencyViolationError('An operation has been performed on an aggregate root that is out of date.');
        return callback(concurrencyViolation);
      }

      domainEvents.forEach(function(domainEvent) {
        storedDocument.events.push(domainEvent);
      });

      callback();
    });
  }

}

