import express, {Request} from "express";

export class MenuResponseAdapter {
    static adapt(menu: any, req: Request) {
        let linkToProduct: String[] = [];
        const restaurant = menu.restaurant ? req.protocol + '://' + req.get('host') + "/restaurant/" + menu.restaurant : "";

        if(menu.products.length > 0){
            menu.products.forEach((product: any) => {
                linkToProduct.push( req.protocol + '://' + req.get('host') + "/product/" + product.toString())
            })
        }

        return {
            name: menu.name,
            amount: menu.amount,
            restaurant: restaurant,
            products: linkToProduct,
            status: menu.status
        };
    }
}