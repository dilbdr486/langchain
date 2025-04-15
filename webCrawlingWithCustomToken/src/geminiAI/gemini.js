import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import dotenv from "dotenv";
dotenv.config();

export const model = new ChatGoogleGenerativeAI({
     model:"gemini-1.5-flash",
     temperature:0,
     apiKey: process.env.GOOGLE_API_KEY,
})