import { Chroma } from "@langchain/community/vectorstores/chroma";
import { embeddingModel } from "../embedding/embeddingModel.js";

// Initialize ChromaDB connection
const vectorstores = new Chroma(
    embeddingModel,
    {
        collectionName: "a-test-collection",
        url: "http://localhost:8000", // Ensure ChromaDB server is running at this URL
    }
);

// Function to check connection to ChromaDB
async function checkChromaConnection() {
    try {
        console.log("Checking connection to ChromaDB...");
        await vectorstores.similaritySearch("test", 1); // Test query
        console.log("Connected to ChromaDB successfully.");
    } catch (error) {
        console.error("Error: Unable to connect to ChromaDB. Please ensure the server is running.");
        throw error; // Re-throw the error to handle it upstream if needed
    }
}

// Modified `processAndStoreWebContent` with logging for debugging
export async function processAndStoreWebContent(url) {
    try {
        console.log(`Fetching all content from: ${url}`);
        const selector = "body *";
        const cheerioLoader = new CheerioWebBaseLoader(url, { selector });
        const docs = await cheerioLoader.load();

        if (docs.length === 0) {
            console.error("No content found on the page.");
            return;
        }

        const validDocs = docs.filter(doc => doc.pageContent && doc.pageContent.trim().length > 0);
        console.log(`Loaded ${validDocs.length} valid content blocks from ${url}.`);

        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
        });

        console.log("Splitting content into manageable chunks...");
        const splitDocs = await textSplitter.splitDocuments(validDocs);
        console.log(`Generated ${splitDocs.length} document chunks.`);

        await vectorstores.addDocuments(splitDocs);
        console.log("Documents stored in ChromaDB:", splitDocs);

    } catch (error) {
        console.error("Error processing and storing web content:", error);
    }
}

// Modified search call with logging
export async function searchFromChroma(query) {
    try {
        console.log("Querying ChromaDB with:", query);
        const retrievedDocs = await vectorstores.similaritySearch(query, 2);
        console.log("Retrieved Documents:", retrievedDocs);

        if (retrievedDocs.length === 0) {
            console.log("No documents found for the query.");
        } else {
            console.log("Found documents:", retrievedDocs);
        }
        return retrievedDocs;
    } catch (error) {
        console.error("Error querying ChromaDB:", error);
    }
}
