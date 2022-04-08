import {config} from "dotenv";
config();


import express from "express";
import mongoose from "mongoose";
import {AuthController} from "./controllers";

const controllerPaths = {
    "/auth": AuthController
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

    // let controller = null
    // for (let path in controllerPaths) {
    //     controller = new controllerPaths.valueOf(path)()
    // }

    // const coffeeController = new CoffeeController()
    // app.use('/coffee', coffeeController.buildRoutes())

    const authController = new AuthController()
    app.use('/auth', authController.buildRoutes())

    app.listen(process.env.PORT)
}

startServer().catch(console.error)