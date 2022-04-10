import {Product} from "../../services/products/domain/product";

export class ProductResponseAdapter {
    static adapt(product: Product) {
        return {
          id: product.id.value,
          name: product.name,
          price: product.price
        };
    }
}