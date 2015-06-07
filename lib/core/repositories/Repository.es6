// ES6 implementation of node_m_r

import eventStore from '../../eventStore';
import eventBus from '../../eventBus';

export default class Repository {
  constructor(Model) {
    this.Model = Model;
  }

  save(modelInstance, callback, commandId) {
    let transientEvents = modelInstance.getTransientEvents();
    eventStore.save(transientEvents, modelInstance.getId(), modelInstance.getVersion(), (error) => {
      if(error)
        return callback(error);

      transientEvents.forEach((domainEvent) => {
        domainEvent.commandId = commandId;
        eventBus.publish(domainEvent);
      });

      callback();
    });
  }

  get(modelInstanceId, callback) {
    eventStore.getAllEventsFor(modelInstanceId, (error, eventStream) => {
      if(error)
        return callback(error);

      if(!eventStream)
        return callback();

      let modelInstance = new this.Model(modelInstanceId);

      eventStream.pipe(modelInstance)
        .on('error', function(error) {
          callback(error);
        })
        .on('finish', function() {
          eventStream.unpipe();
          callback(null, modelInstance);
        });
    });
  }
}
