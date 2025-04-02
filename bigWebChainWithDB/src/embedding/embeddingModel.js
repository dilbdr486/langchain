import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import dotenv from "dotenv";
dotenv.config();

export const embeddingModel = new GoogleGenerativeAIEmbeddings({
    model:"embedding-001",
    apiKey: process.env.GOOGLE_API_KEY,
})