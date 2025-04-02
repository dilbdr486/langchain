import express from "express";
import dotenv from "dotenv";
import { displayVectorStoreData } from "./src/chromaDb/chromaDb.js";
import { processAndStoreWebContent } from "./src/chunks/splitterChain.js";
import { queryOrRespond } from "./src/tool/toolMessage.js";
import { HumanMessage } from "@langchain/core/messages";

const app = express();
dotenv.config();

try {
    await processAndStoreWebContent("https://www.amniltech.com/", "p");
} catch (error) {
    console.error("Error processing and storing web content:", error);
}

try {
    const inputs = { messages: [new HumanMessage("what is task decomposed")] };
    const response = await queryOrRespond(inputs);
    console.log("Response from queryOrRespond:", response.messages[0]);
} catch (error) {
    console.error("Error handling human message query:", error);
}

try {
    await displayVectorStoreData();
} catch (error) {
    console.error("Server initialization failed due to ChromaDB connection issues.");
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});