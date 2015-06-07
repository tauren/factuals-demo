import Product from '../domain/Product';
import repository from '../productRepository';
import CommandHandlers from '../core/commandHandlers/CommandHandlers';

// Sample Command format:
// {
//   aggregateType: "product",
//   command: "renameProduct",
//   id: "c3daeca9-a0de-46d0-9644-bb6cec63952c",
//   payload: {
//     id: "janMax1504",
//     name: "STEFAN JANOSKI MAX ID max"
//   }
// }

export default class ProductCommandHandlers extends CommandHandlers {

  constructor() {
    super();
  }

  handleCreateProduct(command, callback) {
    let product = Product.create(command.payload.id, command.payload);
    repository.save(product, callback, command.id);
  }

  handleRenameProduct(command, callback) {
    repository.get(command.payload.id, (error, product) => {
      if(error) {
        callback(error);
        return;
      }
      try {
        product.rename(command.payload.name);
      }
      catch(e) {
        callback(e);
      }
      repository.save(product, callback, command.id);
    });
  }

  handleUpdateProductPathName(command, callback) {
    repository.get(command.payload.id, (error, product) => {
      if(error) {
        callback(error);
        return;
      }

      try {
        product.updatePathName(command.payload.pathName);
      }
      catch(e) {
        callback(e);
      }
      repository.save(product, callback, command.id);
    });
  }

  handleUpdateProductRenderPath(command, callback) {
    repository.get(command.payload.id, (error, product) => {
      if(error) {
        callback(error);
        return;
      }

      try {
        product.updateRenderPath(command.payload.renderPath);
      }
      catch(e) {
        callback(e);
      }
      repository.save(product, callback, command.id);
    });
  }

  handleUpdateProductTraitColor(command, callback) {
    repository.get(command.payload.id, (error, product) => {
      if(error) {
        callback(error);
        return;
      }

      try {
        product.updateTraitColor(command.payload.trait, command.payload.color);
      }
      catch(e) {
        callback(e);
      }
      repository.save(product, callback, command.id);
    });
  }

  handlePublishProduct(command, callback) {
    repository.get(command.payload.id, (error, product) => {
      if(error) {
        callback(error);
        return;
      }

      try {
        product.publish();
      }
      catch(e) {
        callback(e);
      }
      repository.save(product, callback, command.id);
    });
  }

  handleUnpublishProduct(command, callback) {
    repository.get(command.payload.id, (error, product) => {
      if(error) {
        callback(error);
        return;
      }

      try {
        product.unpublish();
      }
      catch(e) {
        callback(e);
      }
      repository.save(product, callback, command.id);
    });
  }

  handleRemoveProduct(command, callback) {
    repository.get(command.payload.id, (error, product) => {
      if(error) {
        callback(error);
        return;
      }

      try {
        product.remove();
      }
      catch(e) {
        callback(e);
      }
      repository.save(product, callback, command.id);
    });
  }

}
