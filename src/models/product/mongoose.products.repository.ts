import {ProductRepository} from "../../services/products/domain/product.repository";
import {Product} from "../../services/products/domain/product";
import {ProductDocument, ProductModel} from "./mongoose.product.model";
import {ProductAdapter} from "./product.adapter";

export class MongooseProductsRepository implements ProductRepository{
    async getAll (orderParam: any): Promise<Product[]> {
        let order: any = [['spotlight', -1]]
        if (orderParam.order && orderParam.order === "none") {
            order = []
        }
        const products: ProductDocument[] = await ProductModel.find().sort(order).exec();
        return products.map(document => ProductAdapter.adapt(document));
    }

    async create(product: Product): Promise<Product> {
        const created: ProductDocument = await ProductModel.create(product);
        return ProductAdapter.adapt(created);
    }

}