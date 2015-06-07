export default function dummyHandler(message, callback) {
  process.nextTick(callback);
}
