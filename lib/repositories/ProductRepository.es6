// ES6 implementation of node_m_r

import Repository from '../core/repositories/Repository';
import Product from '../domain/Product';

export default class ProductRepository extends Repository {

  static create() {
    return new ProductRepository();
  }

  constructor() {
    super(Product);
  }

}
