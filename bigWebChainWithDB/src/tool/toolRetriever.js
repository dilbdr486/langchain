import { tool } from "@langchain/core/tools";
import vectorstores from "../chromaDb/chromaDb.js";
import { z } from "zod";

// Tool schema
const retrieverSchema = z.object({
  query: z.string().describe("The query for searching in the vectorstore."),
});

// Tool definition
const retrieve = tool(
  async ({ query }) => {
    console.log("🛠 Tool invoked with query:", query); // Log the query

    // Perform similarity search in the vectorstore
    const retrievedDocs = await vectorstores.similaritySearch(query, 2);
    console.log("📄 Retrieved docs:", retrievedDocs); // Log the documents

    // If no documents are found, return a message
    if (!retrievedDocs || retrievedDocs.length === 0) {
      return { content: "No documents found matching the query." };
    }

    // Serialize the results into a readable format
    return {
      content: retrievedDocs
        .map((doc) => `From: ${doc.metadata?.source}\nContent: ${doc.pageContent}`)
        .join("\n\n"),
    };
  },
  {
    name: "retrieve",
    description:
      "Searches a vectorstore to retrieve documents based on query.",
    schema: retrieverSchema,
  }
);

export { retrieve };
