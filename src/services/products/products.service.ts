import {Product, ProductWithoutId} from "./domain/product";
import {ProductRepository} from "./domain/product.repository";
import {ProductModule} from "./product.module";
import {ErrorResponse} from "../../utils";
import {ReductionService} from "../reduction.service";
import {UpdateProductDto} from "../../controllers/products/update-product.dto";

export class ProductsService {
    private static instance: ProductsService;
    private readonly repository: ProductRepository = ProductModule.repository();

    public static getInstance (): ProductsService {
        if (ProductsService.instance === undefined) {
            ProductsService.instance = new ProductsService()
        }
        return ProductsService.instance
    }

    async getAllProducts (orderParam: any): Promise<Product[]> {
        return await this.repository.getAll(orderParam);
    }

    async getOneProductById(productId: string) {
        return await this.repository.getById(productId)
    }

    async createProduct(dto: ProductWithoutId): Promise<Product> {
        if(!dto.name || !dto.price) {
            throw new ErrorResponse('Name or Price missing', 400);
        }
        if(dto.reduction && dto.reduction != "") {
            if (!await ReductionService.getInstance().getReductionById(dto.reduction)) {
                throw new ErrorResponse('Wrong id of reduction', 400);
            }
        }
        const product: Product = Product.withoutId({
            name: dto.name,
            price: dto.price,
            reduction: dto.reduction,
            spotlight: dto.spotlight
        })
        return await this.repository.create(product)
    }

    async updateProduct(dto: UpdateProductDto): Promise<Product>  {
        const product: Product = await this.repository.getById(dto.id);
        if(dto.name != undefined){
            product.name = dto.name;
        }
        if(dto.price != undefined){
            product.price = dto.price;
        }

        if(dto.reduction != undefined){
            product.reduction = dto.reduction;
        }
        return await this.repository.update(product);
    }
}
