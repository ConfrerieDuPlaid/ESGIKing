import {DefaultController} from "../index";
import express, {Request, Response, Router} from "express";
import {ProductsService, RestaurantService} from "../../services";
import {ProductResponseAdapter} from "./product.response.adapter";
import {Product} from "../../services/products/domain/product";

export class ProductsController extends DefaultController {
    private readonly productService = ProductsService.getInstance();
    private readonly restaurantService = RestaurantService.getInstance();

    buildRoutes(): Router {
        const router = express.Router()
        router.get('/', this.getAllProducts.bind(this));
        router.get('/:productID', this.getOneProductById.bind(this));
        router.post('/', express.json(), this.createProduct.bind(this));
        router.patch('/:productID', express.json(), this.updateProduct.bind(this));
        return router;
    }

    async getAllProducts(req: Request, res: Response) {
        await super.sendResponse(req, res, async () => {
            const products: Product[] = await this.productService
                .getAllProducts(req.query.order?.toString())
            return products.map(product => ProductResponseAdapter.adapt(product, req));
        });
    }

    async getOneProductById(req: Request, res: Response) {
        await super.sendResponse(req, res, async () => {
            const product = await this.productService
                .getOneProductById(req.params.productID);
            return ProductResponseAdapter.adapt(product);
        });
    }

    async createProduct(req: Request, res: Response) {
        await super.sendResponse(req, res, async () => {
            const product: Product = await this.productService.createProduct({
                name: req.body.name,
                price: +req.body.price,
                reduction: req.body.reduction
            });
            return ProductResponseAdapter.adapt(product, req);
        }, 201);
    }

    async updateProduct(req: Request, res: Response) {
        await super.sendResponse(req, res, async () => {
            const product: Product = await this.productService.updateProduct({
                id: req.params.productID,
                name: req.body.name,
                price: +req.body.price,
                reduction: req.body.reduction
            });
            return ProductResponseAdapter.adapt(product);
        });
    }

}
