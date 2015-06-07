// Helps simulate using a real database instead of in-memory storage
export default function simulateAsynchronousIO(asynchronousAction) {
  process.nextTick(asynchronousAction);
}
