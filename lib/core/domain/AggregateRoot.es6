import { EventEmitter2 as EventEmitter } from 'eventemitter2';
import stream from 'stream';
import uuidGenerator from 'node-uuid';
import _ from 'lodash';

function enhanceDomainEvent(aggregateRoot, eventName, eventVersion, payload) {
  payload = payload || {};
  payload.id = payload.id || aggregateRoot._id;
  return {
    aggregateRootId: aggregateRoot._id,
    eventId: uuidGenerator.v1(),
    eventName: eventName,
    eventVersion: eventVersion,
    created: new Date(),
    meta: {
      username: 'tmil11' // TODO: use the user who created command
    },
    payload: payload
  };
}

export default class AggregateRoot extends stream.Writable {
  constructor(id) {
    super({ objectMode: true });
    this._id = id;
    this._version = this._eventVersion = 0;
    this._transientEvents = [];

    this._eventEmitter = new EventEmitter();
  }

  apply(eventName, payload) {
    this._eventVersion += 1;
    var domainEvent = enhanceDomainEvent(this, eventName, this._eventVersion, payload);

    this._transientEvents.push(domainEvent);
    this._eventEmitter.emit(eventName, domainEvent);
  }

  getTransientEvents() {
    return this._transientEvents;
  }

  getId() {
    return this._id;
  }

  getVersion() {
    return this._version;
  }

  onEvent(type, listener) {
    return this._eventEmitter.on(type, listener);
  }

  _write(domainEvent, encoding, next) {
    this._eventEmitter.emit(domainEvent.eventName, domainEvent);

    this._eventVersion += 1;
    this._version += 1;
    next();
  }
}
