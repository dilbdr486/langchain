import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

dotenv.config();

if (!process.env.GOOGLE_API_KEY) {
  throw new Error("GOOGLE_API_KEY is not defined in the environment variables.");
}

const model = new ChatGoogleGenerativeAI({
  model: "gemini-1.5-flash",
  apiKey: process.env.GOOGLE_API_KEY,
});

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post("/translate", async (req, res) => {
  const { text } = req.body;
  const messages = [
    new SystemMessage("Translate the following from English into Nepali"),
    new HumanMessage(text),
  ];

  try {
    const response = await model.invoke(messages);
    res.json({ translatedText: response.content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});

// ✅ Fix: Run the AI calls inside an async function
// async function testModel() {
//   const messages = [
//     new SystemMessage("Translate the following from English into Nepali"),
//     new HumanMessage("hi!"),
//   ];

//   try {
//     // Invoke the model with messages
//     const response1 = await model.invoke(messages);
//     console.log("Response 1:", response1.content);

//     // Invoke with a simple text string
//     const response2 = await model.invoke("Hello");
//     console.log("Response 2:", response2.content);

//     // Invoke with role-based messages
//     const response3 = await model.invoke([{ role: "user", content: "Hello" }]);
//     console.log("Response 3:", response3.content);

//     // Invoke using LangChain message objects
//     const response4 = await model.invoke([new HumanMessage("hi!")]);
//     console.log("Response 4:", response4.content);

//     // Stream the response
//     const stream = await model.stream(messages);
//     const chunks = [];

//     for await (const chunk of stream) {
//       chunks.push(chunk);
//       console.log(`${chunk.content}|`); // Print streamed chunks
//     }
//   } catch (error) {
//     console.error("Error in testModel:", error.message);
//   }
// }

// // ✅ Run the test model function
// testModel();
