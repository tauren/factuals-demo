export default class MessageBus {

  static create() {
    return new MessageBus();
  }

  constructor() {
    this._handlers = [];
  }

  registerHandler(handler) {
    this._handlers.push(handler);
  };

  publish(message) {
    this._handlers.forEach(function(handler) {
      process.nextTick(function() {
        handler.write(message);
      });
    });
  };

}
