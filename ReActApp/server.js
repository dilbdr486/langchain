import express from "express";
import "dotenv/config";
import { frnds } from "./src/tools.js";


const app = express();
const port = process.env.PORT;

await frnds();

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
})