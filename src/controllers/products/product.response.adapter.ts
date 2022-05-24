import {Product} from "../../services/products/domain/product";
import {HttpUtils} from "../../utils/http.utils";
import express, {Request} from "express";
import {ProductResponse} from "./product.response";

export class ProductResponseAdapter {
    static adapt(product: Product, req: Request): ProductResponse {
        let reduction = "";
        if(product.reduction){
            reduction = HttpUtils.getBaseUrlOf(req) + '/reduction/' + product.reduction
        }
        return {
          id: product.id.value,
          name: product.name,
          price: product.price,
          reduction: product.reduction
        };
    }
}
