import express from "express";
import "dotenv/config";
import { audioConverter } from "./src/audioTranscript.js";


const app = express();
const port = process.env.PORT;

await audioConverter();

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
})