import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { WebBrowser } from "langchain/tools/webbrowser";
import dotenv from "dotenv";
import axios from "axios";
import { load } from "cheerio"; // Corrected import for cheerio

dotenv.config();

const model = new ChatGoogleGenerativeAI({
    model: "gemini-1.5-flash",
    temperature: 0.2,
    apiKey: process.env.GOOGLE_API_KEY, // Use environment variable
});

const embeddings = new GoogleGenerativeAIEmbeddings();
const webBrowser = new WebBrowser({ model, embeddings });

async function extractLinksFromHomePage(url) {
    try {
        const response = await axios.get(url); // Add timeout
        const $ = load(response.data); // Updated to use the named import
        const links = [];
        $("li a").each((_, element) => { // Target <li> tags with <a> links
            const href = $(element).attr("href");
            const text = $(element).text().trim();
            if (href && !href.startsWith("#")) {
                links.push({ text, href: new URL(href, url).href }); // Resolve relative URLs
            }
        });
        return links.slice(0, 10); // Limit to 10 links
    } catch (error) {
        throw new Error(`Failed to extract links from ${url}: ${error.message}`);
    }
}

export async function performWebSearch(url, query) {
    try {
        const links = await extractLinksFromHomePage(url);
        const results = [];
        for (const { text, href } of links) {
            try {
                const result = await webBrowser.invoke(`"${href}","${query}"`);
                results.push({ text, href, result });
            } catch (error) {
                results.push({ text, href, error: error.message }); // Log errors for individual links
            }
        }
        return results;
    } catch (error) {
        throw new Error(`Error during web search: ${error.message}`);
    }
}
