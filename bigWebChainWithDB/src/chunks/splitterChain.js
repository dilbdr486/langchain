import { Chroma } from "@langchain/community/vectorstores/chroma";
import { embeddingModel } from "../embedding/embeddingModel.js";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import axios from "axios";
import { load } from "cheerio";

const vectorstores = new Chroma(embeddingModel, {
  collectionName: "a-test-collection",
  url: "http://localhost:8000",
});

async function extractLinksFromHomePage(url) {
  try {
    const response = await axios.get(url);
    const $ = load(response.data);
    const links = [];

    $("li a, nav a, ul a, div a, footer a").each((_, element) => {
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
    console.log(`🔍 Fetching links from: ${url}`);
    const links = await extractLinksFromHomePage(url);
    const allStoredDocs = [];

    for (const { href } of links) {
      console.log(`🌐 Processing: ${href}`);

      // Load HTML content
      const { data: html } = await axios.get(href);
      const $ = load(html);

      // Remove unwanted elements
      $("script, style, noscript, iframe, nav, footer, header, svg").remove();

      // Extract clean text from the body
      const cleanText = $("body").text().replace(/\s+/g, " ").trim();

      if (!cleanText || cleanText.length < 100) {
        console.log(`⚠️ Skipping: Not enough meaningful content on ${href}`);
        continue;
      }

      const docs = [
        {
          pageContent: cleanText,
          metadata: {
            source: href,
            title: $("title").text() || "",
          },
        },
      ];

      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });

      const splitDocs = await textSplitter.splitDocuments(docs);
      console.log(`✂️ Chunked into ${splitDocs.length} pieces.`);

      await vectorstores.addDocuments(splitDocs);
      console.log(`✅ Stored: ${href}`);
      allStoredDocs.push(...splitDocs);
    }

    return allStoredDocs;
  } catch (error) {
    console.error("❌ Error processing web content:", error.message);
    throw error;
  }
}
