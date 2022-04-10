import {Product} from "./product";

export interface ProductRepository {
    getAll():Promise<Product[]>;
    create(product: Product): Promise<Product>;
}