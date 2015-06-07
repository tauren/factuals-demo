export default function ProductPathNameUpdated(productPathNameUpdated) {
  this.pathName = productPathNameUpdated.payload.pathName;
};
