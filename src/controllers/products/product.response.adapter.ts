import {Product} from "../../services/products/domain/product";

export class ProductResponseAdapter {
    static adapt(product: Product) {
        let reduction = "";
        if(product.reduction){
            reduction = "http://localhost:3001/reduction/" + product.reduction
        }
        return {
          id: product.id.value,
          name: product.name,
          price: product.price,
          reduction: reduction
        };
    }
}