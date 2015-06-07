import stream from 'stream';
import dummyHandler from '../utils/dummyHandler';

export default class CommandHandlers extends stream.Writable {
  constructor() {
    super({ objectMode: true });
  }
  _write(command, encoding, next) {
    let commandHandlerName = 'handle' + command.command;
    let commandHandler = this[commandHandlerName] || dummyHandler;
    // console.log('handling command',commandHandlerName, commandHandler);
    commandHandler.call(this, command, error => {
      if(error) {
        console.log(error);
        return;
      }
      next();
    });
  }
}
