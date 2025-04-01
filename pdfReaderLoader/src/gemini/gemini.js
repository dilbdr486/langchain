import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import dotenv from "dotenv";

dotenv.config();

const model = new ChatGoogleGenerativeAI({
    model: "gemini-1.5-flash",
    temperature: 0.2,
    apiKey: process.env.GOOGLE_API_KEY,
});

const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
});

let docs = [];

async function updateDocs(newDocs) {
    docs = newDocs;
    const splits = await textSplitter.splitDocuments(docs);
    console.log("Splits:", splits); // Log the document splits

    const vectorStore = await MemoryVectorStore.fromDocuments(
        splits,
        new GoogleGenerativeAIEmbeddings()
    );

    retriever = vectorStore.asRetriever();
    console.log("Retriever initialized:", retriever); // Log retriever initialization
}

let retriever = null;

export { retriever, model, updateDocs };