import express, {Request} from "express";
import {HttpUtils} from "../../utils/http.utils";
import {MenuProps} from "../../models/menus/menu.model";

export class MenuResponseAdapter {
    static adapt(menu: MenuProps, req: Request) {
        let linkToProduct: String[] = [];
        const restaurant = menu.restaurant
            ? HttpUtils.getFullUrlOf(req) + menu.restaurant
            : "";

        menu.products.forEach((product: string) => {
            linkToProduct.push( HttpUtils.getFullUrlOf(req) + product)
        })

        return {
            name: menu.name,
            amount: menu.amount,
            restaurant: restaurant,
            products: linkToProduct,
            status: menu.status
        };
    }
}