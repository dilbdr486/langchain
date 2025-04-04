import express from "express";
import dotenv from "dotenv";
import { connectionWeaviate } from "./src/weaviateCon.js";
import { dataCollection } from "./src/dataCollection.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT ||8000;

await connectionWeaviate();
await dataCollection();

app.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`);
    
})