import {config} from "dotenv";
config();

const app = require("express")

app.listen(process.env.PORT)