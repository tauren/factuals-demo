export default function ProductRenderPathUpdated(productRenderPathUpdated) {
  this.renderPath = productRenderPathUpdated.payload.renderPath;
};
