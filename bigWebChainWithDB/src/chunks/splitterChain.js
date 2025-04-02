import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import vectorstores from "../chromaDb/chromaDb.js";

export async function processAndStoreWebContent(url, selector = "p") {
    const cheerioLoader = new CheerioWebBaseLoader(url, { selector });

    try {
        const docs = await cheerioLoader.load();
        if (docs.length === 0) {
            console.error("No documents loaded, check the source or URL.");
            return;
        }

        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200
        });

        const splitDocs = await textSplitter.splitDocuments(docs);
        if (splitDocs.length === 0) {
            console.error("No documents were split. Please check the chunking process.");
            return;
        }

        await vectorstores.addDocuments(splitDocs);
        console.log("Documents successfully added to ChromaDB.");
    } catch (error) {
        console.error("Error processing web content:", error);
    }
}
