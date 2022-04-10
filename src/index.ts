import {config} from "dotenv";
config();


import express from "express";
import mongoose from "mongoose";
import {AuthController} from "./controllers/"
import {ProductsController} from "./usecases/products/exposition/products.controller";

const controllerPaths = {
    "/auth": AuthController,
    "/products": ProductsController
}

async function startServer (): Promise<void> {
    await mongoose.connect(process.env.MONGO_URI as string, {
        auth: {
            username: process.env.MONGO_USER as string,
            password: process.env.MONGO_PWD as string
        }
    })

    const app = express()

    app.get('/', function (req, res) {
        res.send("Hello and welcome to ESGIKing !")
    })

    const authController = new AuthController()
    app.use('/auth', authController.buildRoutes())

    const productsController = new ProductsController();
    app.use('/products', productsController.buildRoutes());

    app.listen(process.env.PORT, () => {
        console.log("Server listening on port " + process.env.PORT);
    });
}

startServer().catch(console.error)