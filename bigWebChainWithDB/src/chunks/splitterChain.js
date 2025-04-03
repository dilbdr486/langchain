import { Chroma } from "@langchain/community/vectorstores/chroma";
import { embeddingModel } from "../embedding/embeddingModel.js";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio"; // Import CheerioWebBaseLoader
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters"; // Import RecursiveCharacterTextSplitter
import axios from "axios";
import { load } from "cheerio"; // Import cheerio for link extraction

// Initialize ChromaDB connection
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

// Function to extract links from a webpage
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
        return links.slice(0, 10); // Limit to 10 links
    } catch (error) {
        throw new Error(`Failed to extract links from ${url}: ${error.message}`);
    }
}

// Updated processAndStoreWebContent to process links
export async function processAndStoreWebContent(url) {
    try {
        console.log(`Fetching all content from: ${url}`);
        const links = await extractLinksFromHomePage(url);
        const allStoredDocs = []; // Collect all stored documents

        for (const { href } of links) {
            console.log(`Processing content from link: ${href}`);
            const selector = "p, li, a, span, h1, h2, h3, h4, h5, h6, ul, ol, form, div, section, article, footer, header, aside, *";
            const cheerioLoader = new CheerioWebBaseLoader(href, { selector });
            const docs = await cheerioLoader.load();

            if (docs.length === 0) {
                console.error(`No content found on the page: ${href}`);
                continue;
            }

            const textSplitter = new RecursiveCharacterTextSplitter({
                chunkSize: 1000,
                chunkOverlap: 200,
            });

            console.log("Splitting content into manageable chunks...");
            const splitDocs = await textSplitter.splitDocuments(docs);
            console.log(`Generated ${splitDocs.length} document chunks.`);

            // Count the number of tags and extract text
            const tagCounts = {};
            docs.forEach((doc) => {
                const content = doc.pageContent || "";
                const matches = content.match(/<\s*\/?\s*([a-zA-Z0-9]+)[^>]*>/g) || [];
                matches.forEach((tag) => {
                    const tagName = tag.replace(/<\/?|\/?>/g, "").split(" ")[0];
                    tagCounts[tagName] = (tagCounts[tagName] || 0) + 1;
                });
            });

            console.log("Tag Counts:", tagCounts);

            await vectorstores.addDocuments(splitDocs);
            console.log(`Documents from ${href} stored in ChromaDB.`);
            allStoredDocs.push(...splitDocs); // Add stored documents to the collection
        }

        return allStoredDocs; // Return all stored documents
    } catch (error) {
        console.error("Error processing and storing web content:", error);
        throw error; // Re-throw the error for upstream handling
    }
}

// Modified search call with logging
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
