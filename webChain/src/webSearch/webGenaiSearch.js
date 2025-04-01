import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { WebBrowser } from "langchain/tools/webbrowser";
import dotenv from "dotenv";

dotenv.config();

const model = new ChatGoogleGenerativeAI({
    model: "gemini-1.5-flash",
    temperature: 0.2,
    apiKey: process.env.GOOGLE_API_KEY, // Use environment variable
});

const embeddings = new GoogleGenerativeAIEmbeddings();
const webBrowser = new WebBrowser({ model, embeddings });

export async function performWebSearch(url, query) {
    return await webBrowser.invoke(`"${url}","${query}"`);
}
