import { z } from "zod";
import vectorstores from "../chromaDb/chromaDb.js";
import { tool } from "@langchain/core/tools";

const retrieverSchema = z.object({ query: z.string() });

export const retrieve = tool(
    async ({ query }) => {
      const retrievedDocs = await vectorstores.similaritySearch(query, 2);
      const serialized = retrievedDocs
        .map(
          (doc) => `Source: ${doc.metadata.source}\nContent: ${doc.pageContent}`
        )
        .join("\n");
      return [serialized, retrievedDocs];
    },
    {
      name: "retrieve",
      description: "Retrieve information related to a query.",
      schema: retrieverSchema,
      responseFormat: "content_and_artifact",
    }
  );
