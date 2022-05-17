import {Product} from "./product";

export interface ProductRepository {
    getAll(orderParam: any):Promise<Product[]>;
    create(product: Product): Promise<Product>;
}