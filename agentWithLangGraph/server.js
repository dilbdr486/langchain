import express from "express";
import "dotenv/config";
import { agentTools } from "./src/agent.js";

const app = express();
const port = process.env.PORT;

await agentTools();

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
})