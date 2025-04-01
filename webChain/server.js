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
        const result = await performWebSearch(url, query);
        res.json({ result });
    } catch (error) {
        res.status(500).send("Error performing web search");
    }
});

app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
});