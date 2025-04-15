import { embeddingModel } from "../embedding/embeddingModel.js";
import { WeaviateStore } from "@langchain/weaviate";
import "dotenv/config";
import weaviate from "weaviate-ts-client"


// Initialize Weaviate client
const client = weaviate.client({
    scheme: process.env.WEAVIATE_SCHEME,    
    host: process.env.WEAVIATE_HOST
});

// Set up the vector store with Weaviate
const vectorStore = new WeaviateStore(embeddingModel, {
  client,
  indexName: "Langchainjs_test",
  textKey: "text",
  metadataKeys: ["source"],
});

// Function to display all stored data
export async function displayVectorStoreData() {
  try {
    await checkChromaConnection();
    console.log("Fetching all vector store data...");

    const storedDocuments = await vectorStore.similaritySearch("", 1000);
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
    await vectorStore.deleteCollection();
    console.log(
      "Collection deleted successfully. All data cleared from ChromaDB."
    );
  } catch (error) {
    console.error("Error clearing data from ChromaDB:", error);
  }
}

export default vectorStore;
