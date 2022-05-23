import {ProductRepository} from "../../services/products/domain/product.repository";
import {Product} from "../../services/products/domain/product";
import {ProductDocument, ProductModel} from "./mongoose.product.model";
import {ProductAdapter} from "./product.adapter";
import {ErrorResponse} from "../../utils";

export class MongooseProductsRepository implements ProductRepository{
    async getAll (orderParam: string | undefined): Promise<Product[]> {
        const desc = -1
        let order: any = [['spotlight', desc]]
        if (orderParam && orderParam === "none") {
            order = []
        }
        const products: ProductDocument[] = await ProductModel.find().sort(order).exec();
        return products.map(document => ProductAdapter.adapt(document));
    }

    async create(product: Product): Promise<Product> {
        const created: ProductDocument = await ProductModel.create(product);
        return ProductAdapter.adapt(created);
    }

    async getById(id: string): Promise<Product> {
        const product: ProductDocument | null = await ProductModel.findById(id);
        if(!product) {
            throw new ErrorResponse('Product Not Found', 404);
        }
        return ProductAdapter.adapt(product);
    }

    async update(newProduct: Product): Promise<Product> {
        const old = await ProductModel.findById(newProduct.id.value).exec();
        if(!old) throw new ErrorResponse('Product Not Found', 404);
        old.name = newProduct.name;
        old.price = newProduct.price;
        if(newProduct.reduction)
            old.reduction = newProduct.reduction;
        return ProductAdapter.adapt(await old.save());
    }

}
