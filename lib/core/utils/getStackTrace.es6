export default getStackTrace = function() {
  let obj = {};
  Error.captureStackTrace(obj, getStackTrace);
  return obj.stack;
}
