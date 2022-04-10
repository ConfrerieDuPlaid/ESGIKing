import {ProductDocument} from "./mongoose.product.model";
import {Product} from "../domain/product";
import {ProductId} from "../domain/product.id";

export class ProductAdapter {
    static adapt(source: ProductDocument): Product {
        return new Product({
            id: new ProductId(source._id),
            name: source.name,
            price: +source.price
        })
    }
}