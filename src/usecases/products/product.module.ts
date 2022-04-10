import {ProductRepository} from "./domain/product.repository";
import {MongooseProductsRepository} from "./infrastructure/mongoose.products.repository";

export class ProductModule {
    static repository(): ProductRepository {
        return new MongooseProductsRepository();
    }
}