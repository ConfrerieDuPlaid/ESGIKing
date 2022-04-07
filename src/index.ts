import {config} from "dotenv";
config();

import express from "express";


const app = express();

app.listen(process.env.PORT, function() {
    console.log("Server listening on port " + process.env.PORT);
});