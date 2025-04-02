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

// Function to display stored data
export async function displayVectorStoreData() {
    try {
        await checkChromaConnection(); // Ensure connection before proceeding
        console.log("Fetching vector store data...");

        // Retrieve a few documents from the collection to check if data exists
        const storedDocuments = await vectorstores.similaritySearch("test", 1);
        if (storedDocuments.length === 0) {
            console.log("No vectors found in the collection.");
            return;
        }

        console.log("Stored Documents:");
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

export default vectorstores;