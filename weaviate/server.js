import express from "express";
import dotenv from "dotenv";
import { main as connectToWeaviate } from "./src/ucdConnection/ucdConnection.js";

const app = express();
const PORT = process.env.PORT || 7000;
dotenv.config();

app.listen(PORT, async () => {
  console.log(`server is running port ${PORT}`);
  await connectToWeaviate(); // Connect to Weaviate when the server starts
});