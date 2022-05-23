import {ProductId} from "./product.id";


export class Product implements ProductProps{
    id: ProductId;
    name: string;
    price: number;
    reduction: string;
    spotlight?: boolean

    constructor(props: ProductProps) {
        this.id = props.id;
        this.name = props.name;
        this.price = props.price;
        this.reduction = props.reduction;
        this.spotlight = props.spotlight ? props.spotlight : false
    }

    static withoutId(props: ProductWithoutId) {
        return new Product({
            id: new ProductId(''),
            name: props.name,
            price: props.price,
            reduction: props.reduction,
            spotlight: props.spotlight
        })
    }

}

export interface ProductProps {
    readonly id: ProductId;
    readonly name: string;
    readonly price: number;
    readonly reduction: string;
    readonly spotlight?: boolean
}

export type ProductWithoutId = Pick<ProductProps, "name" | "price" | "reduction" | "spotlight">
