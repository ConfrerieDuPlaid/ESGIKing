import {Product} from "../../services/products/domain/product";
import {HttpUtils} from "../../utils/http.utils";

export class ProductResponseAdapter {
    static adapt(product: Product) {
        let reduction = "";
        if(product.reduction){
            reduction = HttpUtils.getBaseUrlOf(req) + '/reduction/' + product.reduction
        }
        return {
          id: product.id.value,
          name: product.name,
          price: product.price,
          reduction: reduction
        };
    }
}