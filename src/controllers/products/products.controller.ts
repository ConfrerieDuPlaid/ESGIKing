import {DefaultController} from "../index";
import express, {Request, Response, Router} from "express";
import {ProductsService} from "../../services/products/products.service";
import {ProductResponseAdapter} from "./product.response.adapter";
import {Product} from "../../services/products/domain/product";

export class ProductsController extends DefaultController {
    private readonly productService: ProductsService = ProductsService.getInstance();

    buildRoutes(): Router {
        const router = express.Router()
        router.get('/', this.getAllProducts.bind(this));
        router.post('/', express.json(), this.createProduct.bind(this));
        return router;
    }

    /**
     * Method : GET
     * URL : /products
     * Permissions required : none
     *
     * @param req HTTP request object
     * @param res HTTP response object
     *
     * @returns ProductDocument or 500 error
     */
    async getAllProducts(req: Request, res: Response) {
        await super.sendResponse(req, res, async () => {
            const products: Product[] = await this.productService
                .getAllProducts()
            return products.map(product => ProductResponseAdapter.adapt(product));
        });
    }

    /**
     * Method : POST
     * URL : /products
     * Permissions required : OrderPicker
     *
     * @param req HTTP request object with JSON object
     * {
     *     "name": "{{product name}}",
     *     "price": {{price}}
     * }
     * @param res HTTP response object
     *
     * @returns ProductDocument or 500 error
     */
    async createProduct(req: Request, res: Response) {
        await super.sendResponse(req, res, async () => {
            const product: Product = await this.productService.createProduct({
                name: req.body.name,
                price: +req.body.price,
                reduction: req.body.reduction
            });
            return ProductResponseAdapter.adapt(product);
        }, 201);
    }

}