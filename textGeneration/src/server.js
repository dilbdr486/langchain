import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import session from "express-session";

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
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
  })
);

app.post("/api/genai", async (req, res) => {
  const { text } = req.body;

  if (!req.session.history) {
    req.session.history = [];
  }

  const messages = [
    ...req.session.history.map((msg) =>
      msg.role === "system"
        ? new SystemMessage(msg.content)
        : new HumanMessage(msg.content)
    ),
    new HumanMessage(text),
  ];

  try {
    const response = await model.invoke(messages);
    req.session.history.push({ role: "human", content: text });
    req.session.history.push({ role: "system", content: response.content });
    res.json({ message: response.content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});