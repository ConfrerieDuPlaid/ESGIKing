import {Product, ProductProps, ProductWithoutId} from "./domain/product";
import {ProductRepository} from "./domain/product.repository";
import {ProductModule} from "./product.module";
import {ErrorResponse} from "../../utils";

export class ProductsService {
    private static instance: ProductsService;
    private readonly repository: ProductRepository = ProductModule.repository();

    public static getInstance (): ProductsService {
        if (ProductsService.instance === undefined) {
            ProductsService.instance = new ProductsService()
        }
        return ProductsService.instance
    }

    async getAllProducts(): Promise<Product[]> {
        return await this.repository.getAll();
    }

    async createProduct(dto: ProductWithoutId): Promise<Product> {
        if(!dto.name || !dto.price) {
            throw new ErrorResponse('Name or Price missing', 400);
        }
        const product: Product = Product.withoutId({
            name: dto.name,
            price: dto.price
        })
        return await this.repository.create(product)
    }
}