export default function ProductCreated(productCreated) {
  this.name = productCreated.payload.name;
  this.pathName = productCreated.payload.pathName;
  this.renderPath = productCreated.payload.renderPath;

  this.images = productCreated.payload.images;
  this.views = productCreated.payload.views;
  this.bomComponents = productCreated.payload.bomComponents;
  this.groups = productCreated.payload.groups;
  this.traits = productCreated.payload.traits;
  this.palettes = productCreated.payload.palettes;
  this.stylecolors = productCreated.payload.stylecolors;
  this.prebuilds = productCreated.payload.prebuilds;
};

