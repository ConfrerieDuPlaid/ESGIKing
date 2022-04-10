import {ProductRepository} from "../domain/product.repository";
import {Product} from "../domain/product";
import {ProductDocument, ProductModel} from "./mongoose.product.model";
import {ProductAdapter} from "./product.adapter";

export class MongooseProductsRepository implements ProductRepository{
    async getAll(): Promise<Product[]> {
        const products: ProductDocument[] = await ProductModel.find().exec();
        return products.map(document => ProductAdapter.adapt(document));
    }

    async create(product: Product): Promise<Product> {
        const created: ProductDocument = await ProductModel.create(product);
        return ProductAdapter.adapt(created);
    }

}