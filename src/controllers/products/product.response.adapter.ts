import {Product} from "../../services/products/domain/product";
import {ProductResponse} from "./product.response";

export class ProductResponseAdapter {
    static adapt(product: Product): ProductResponse {
        return {
          id: product.id.value,
          name: product.name,
          price: product.price,
          reduction: reduction
        };
    }
}