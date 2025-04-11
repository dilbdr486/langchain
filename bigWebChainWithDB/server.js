import express from "express";
import dotenv from "dotenv";
import { displayVectorStoreData, clearVectorStoreData } from "./src/chromaDb/chromaDb.js";
import { processAndStoreWebContent } from "./src/chunks/splitterChain.js";
import { queryOrRespond } from "./src/tool/toolMessage.js";
import { HumanMessage } from "@langchain/core/messages";
import { generate } from "./src/tool/toolMessage.js";

const app = express();
dotenv.config();

app.use(express.json()); // Middleware to parse JSON request bodies

// API to load data into ChromaDB
app.post("/api/load-data", async (req, res) => {
    const { url } = req.body;
    if (!url) {
        return res.status(400).json({ error: "URL is required" });
    }

    try {
        console.log(`Processing and storing web content from ${url}...`);
        const storedData = await processAndStoreWebContent(url);

        console.log("Stored Data:", storedData); // Log the stored data
        res.status(200).json({ 
            message: "Data successfully loaded into ChromaDB", 
            storedData, // Return the stored data in the response
            tagCounts: storedData.tagCounts // Include tag counts in the response
        });
    } catch (error) {
        console.error("Error processing and storing web content:", error);
        res.status(500).json({ error: "Failed to load data into ChromaDB" });
    }
});

// API to handle human message queries
// API to handle human message queries
app.post("/api/query", async (req, res) => {
    const { message } = req.body;
    if (!message) {
        return res.status(400).json({ error: "Message is required" });
    }

    try {
        console.log(`User Query: ${message}`);

        const inputs = { messages: [new HumanMessage(message)] };
        const response = await queryOrRespond(inputs);

        // Step 2: Generate the final answer using the retrieved tool result
        const finalResponse = await generate(response);

        // Extract AI's actual text response
        const aiMessage = finalResponse.messages[0]?.content || "No response from AI";

        console.log(`AI Response: ${aiMessage}`);

        res.status(200).json({ response: aiMessage });
    } catch (error) {
        console.error("Error handling human message query:", error);
        res.status(500).json({ error: "Failed to process the query" });
    }
});



// Display vector store data (optional for debugging)
app.get("/api/display-data", async (req, res) => {
    try {
        console.log("Fetching vector store data...");
        await displayVectorStoreData();
        res.status(200).json({ message: "Vector store data displayed in the console" });
    } catch (error) {
        console.error("Error displaying vector store data:", error);
        res.status(500).json({ error: "Failed to display vector store data" });
    }
});

// API to clear all data from ChromaDB
app.delete("/api/clear-data", async (req, res) => {
    try {
        await clearVectorStoreData();
        res.status(200).json({ message: "All data cleared from ChromaDB." });
    } catch (error) {
        console.error("Error clearing data from ChromaDB:", error);
        res.status(500).json({ error: "Failed to clear data from ChromaDB." });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});