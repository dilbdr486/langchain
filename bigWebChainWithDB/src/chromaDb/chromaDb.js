import { Chroma } from "@langchain/community/vectorstores/chroma";
import { embeddingModel } from "../embedding/embeddingModel.js";

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

// Function to display all stored data
export async function displayVectorStoreData() {
    try {
        await checkChromaConnection(); // Ensure connection before proceeding
        console.log("Fetching all vector store data...");

        // Use a broad query to fetch all documents
        const storedDocuments = await vectorstores.similaritySearch("", 1000); // Adjust the limit as needed
        if (storedDocuments.length === 0) {
            console.log("No vectors found in the collection.");
            return;
        }

        console.log("All Stored Documents:");
        storedDocuments.forEach((doc, index) => {
            console.log(`Document ${index + 1}:`);
            console.log(`Content: ${doc.pageContent}`);
            console.log(`Metadata: ${JSON.stringify(doc.metadata)}`);
            console.log("-----");
        });
    } catch (error) {
        console.error("Error fetching vector store data:", error);
    }
}

// Function to clear all data from ChromaDB
export async function clearVectorStoreData() {
    try {
        console.log("Attempting to delete the collection...");
        await vectorstores.deleteCollection(); // Deletes the entire collection
        console.log("Collection deleted successfully. All data cleared from ChromaDB.");
    } catch (error) {
        console.error("Error clearing data from ChromaDB:", error);
    }
}

export default vectorstores;