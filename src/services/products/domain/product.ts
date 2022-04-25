import {ProductId} from "./product.id";



export class Product implements ProductProps{
    readonly id: ProductId;
    readonly name: string;
    readonly price: number;

    constructor(props: ProductProps) {
        this.id = props.id;
        this.name = props.name;
        this.price = props.price;
    }

    static withoutId(props: ProductWithoutId) {
        return new Product({
            id: new ProductId(''),
            name: props.name,
            price: props.price
        })
    }

}

export interface ProductProps {
    readonly id: ProductId;
    readonly name: string;
    readonly price: number;
}

export type ProductWithoutId = Pick<ProductProps, "name" | "price">