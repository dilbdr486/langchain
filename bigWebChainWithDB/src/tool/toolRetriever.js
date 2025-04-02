import { z } from "zod";
import { tool } from "@langchain/core/tools";
import vectorstores from "../chromaDb/chromaDb.js";

const retrieverSchema = z.object({ query: z.string() });

export const retrieve = tool(
    async ({ query }) => {
        console.log("Querying ChromaDB with:", query);
        const retrievedDocs = await vectorstores.similaritySearch(query, 2);
        console.log("Retrieved Documents:", retrievedDocs);

        const serializedDocs = retrievedDocs
            .map(
                (doc) => `source: ${doc.metadata.source}\ncontent: ${doc.pageContent}`
            )
            .join("\n");

        return [serializedDocs, retrievedDocs];
    },
    {
        name: "retrieve",
        description: "Retrieve information related to a query.",
        schema: retrieverSchema,
        responseFormat: "content_and_artifact",
    }
);
