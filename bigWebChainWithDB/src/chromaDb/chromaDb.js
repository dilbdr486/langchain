import { Chroma } from "@langchain/community/vectorstores/chroma";
import { embeddingModel } from "../embedding/embeddingModel.js";

const vectorstores = new Chroma(
    embeddingModel,
    {
        collectionName: "a-test-collection",
        url: "http://localhost:8000",
    }
);

async function checkChromaConnection() {
    try {
        console.log("Checking connection to ChromaDB...");
        await vectorstores.similaritySearch("test", 1);
        console.log("Connected to ChromaDB successfully.");
    } catch (error) {
        console.error("Error: Unable to connect to ChromaDB.");
        throw error;
    }
}

export async function displayVectorStoreData() {
    try {
        await checkChromaConnection();
        console.log("Fetching all vector store data...");
        const storedDocuments = await vectorstores.similaritySearch("", 1000);
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

export async function clearVectorStoreData() {
    try {
        console.log("Attempting to delete the collection...");
        await vectorstores.deleteCollection();
        console.log("Collection deleted successfully.");
    } catch (error) {
        console.error("Error clearing data from ChromaDB:", error);
    }
}

export default vectorstores;