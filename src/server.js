import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.GOOGLE_API_KEY) {
  throw new Error("GOOGLE_API_KEY is not defined in the environment variables.");
}

const model = new ChatGoogleGenerativeAI({
  model: "gemini-1.5-flash",  // Use "gemini-pro" or "gemini-1.5-pro"
  apiKey: process.env.GOOGLE_API_KEY, // Set your Gemini API key
});

const messages = [
  new SystemMessage("Translate the following from English into nepali"),
  new HumanMessage("hi!"),
];

// Invoke the model with messages
const response1 = await model.invoke(messages);
console.log(response1.content);  // Output response

// Invoke with a simple text string
const response2 = await model.invoke("Hello");
console.log(response2.content);

// Invoke with role-based messages
const response3 = await model.invoke([{ role: "user", content: "Hello" }]);
console.log(response3.content);

// Invoke using LangChain message objects
const response4 = await model.invoke([new HumanMessage("hi!")]);
console.log(response4.content);

// Stream the response
const stream = await model.stream(messages);

const chunks = [];
for await (const chunk of stream) {
  chunks.push(chunk);
  console.log(`${chunk.content}|`); // Print streamed chunks
}
