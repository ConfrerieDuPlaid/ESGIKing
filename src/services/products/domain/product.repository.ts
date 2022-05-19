import {Product} from "./product";

export interface ProductRepository {
    getAll(orderParam: string | undefined):Promise<Product[]>;
    create(product: Product): Promise<Product>;
}