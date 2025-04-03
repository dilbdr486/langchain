import { Chroma } from "@langchain/community/vectorstores/chroma";
import { embeddingModel } from "../embedding/embeddingModel.js";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import axios from "axios";
import { load } from "cheerio";

const vectorstores = new Chroma(
    embeddingModel,
    {
        collectionName: "a-test-collection",
        url: "http://localhost:8000",
    }
);

async function extractLinksFromHomePage(url) {
    try {
        const response = await axios.get(url);
        const $ = load(response.data);
        const links = [];
        $("li a").each((_, element) => {
            const href = $(element).attr("href");
            const text = $(element).text().trim();
            if (href && !href.startsWith("#")) {
                links.push({ text, href: new URL(href, url).href });
            }
        });
        return links.slice(0, 10);
    } catch (error) {
        throw new Error(`Failed to extract links from ${url}: ${error.message}`);
    }
}

export async function processAndStoreWebContent(url) {
    try {
        console.log(`Fetching all content from: ${url}`);
        const links = await extractLinksFromHomePage(url);

        for (const { href } of links) {
            console.log(`Processing content from link: ${href}`);
            const selector = "p, li, a, span, h1, h2, h3, h4, h5, h6, ul, ol, form, div, section, article, footer, header, aside, *";
            const cheerioLoader = new CheerioWebBaseLoader(href, { selector });
            const docs = await cheerioLoader.load();

            if (docs.length === 0) {
                console.error(`No content found on the page: ${href}`);
                continue;
            }

            const validDocs = docs
                .filter(doc => doc.pageContent && doc.pageContent.trim().length > 0)
                .map(doc => ({
                    ...doc,
                    pageContent: doc.pageContent
                        .replace(/[^a-zA-Z0-9\s]/g, "")
                        .replace(/\s+/g, " ")
                        .trim(),
                }));

            console.log(`Loaded ${validDocs.length} valid content blocks from ${href}.`);

            const textSplitter = new RecursiveCharacterTextSplitter({
                chunkSize: 1000,
                chunkOverlap: 200,
            });

            console.log("Splitting content into manageable chunks...");
            const splitDocs = await textSplitter.splitDocuments(validDocs);
            console.log(`Generated ${splitDocs.length} document chunks.`);

            await vectorstores.addDocuments(splitDocs);
            console.log(`Documents from ${href} stored in ChromaDB.`);
        }
    } catch (error) {
        console.error("Error processing and storing web content:", error);
    }
}

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
