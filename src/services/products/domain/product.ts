import {ProductId} from "./product.id";



export class Product implements ProductProps{
    readonly id: ProductId;
    readonly name: string;
    readonly price: number;
    readonly reduction: string;

    constructor(props: ProductProps) {
        this.id = props.id;
        this.name = props.name;
        this.price = props.price;
        this.reduction = props.reduction;
    }

    static withoutId(props: ProductWithoutId) {
        return new Product({
            id: new ProductId(''),
            name: props.name,
            price: props.price,
            reduction: props.reduction
        })
    }

}

export interface ProductProps {
    readonly id: ProductId;
    readonly name: string;
    readonly price: number;
    readonly reduction: string;
}

export type ProductWithoutId = Pick<ProductProps, "name" | "price" | "reduction">