import express from "express";
import dotenv from "dotenv";
import { performWebSearch } from "./src/webSearch/webGenaiSearch.js";

dotenv.config(); // Load environment variables

const app = express();
app.use(express.json()); // Middleware to parse JSON bodies

const PORT = process.env.PORT || 8000;

app.post("/search", async (req, res) => {
    const { url, query } = req.body; // Extract from JSON body
    if (!url || !query) {
        return res.status(400).send("Missing 'url' or 'query' in request body");
    }
    try {
        console.log(`Received request with URL: ${url} and Query: ${query}`);
        const results = await performWebSearch(url, query); // Get the array of results
        console.log(`Final results:`, results); // Log the final results
        res.json(results); // Send the results array
    } catch (error) {
        console.error(`Error: ${error.message}`);
        res.status(500).send(`Error performing web search: ${error.message}`);
    }
});

app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
});