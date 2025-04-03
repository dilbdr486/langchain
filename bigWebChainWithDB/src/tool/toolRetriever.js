import { z } from "zod";
import vectorstores from "../chromaDb/chromaDb.js";

const retrieverSchema = z.object({ query: z.string() });

export const retrieve = async ({ query }) => {
    console.log("Querying ChromaDB with:", query);
    const retrievedDocs = await vectorstores.similaritySearch(query, 20); // Retrieve up to 20 documents
    console.log("Retrieved Documents from ChromaDB:", retrievedDocs);

    const serializedDocs = retrievedDocs
        .map(
            (doc) => `source: ${doc.metadata.source}\ncontent: ${doc.pageContent}`
        )
        .join("\n");

    return [serializedDocs, retrievedDocs];
};
