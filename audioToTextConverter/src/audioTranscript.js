import {
  AudioTranscriptLoader,
  // AudioTranscriptParagraphsLoader,
  // AudioTranscriptSentencesLoader
} from "@langchain/community/document_loaders/web/assemblyai";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";// Import Google Gemini model

// Get __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Hindi Audio to Text Converter
export const audioConverter = async () => {
  const audioUrl = path.resolve(__dirname, "espn.m4a");

  // Check if file exists
  if (!fs.existsSync(audioUrl)) {
    throw new Error(`Audio file not found at path: ${audioUrl}`);
  }

  // Load audio and set language to Hindi
  const loader = new AudioTranscriptLoader(
    {
      audio: audioUrl,
      language_code: "en", // Set transcription language to Hindi
    },
    {
      apiKey: process.env.ASSEMBLYAI_API_KEY,
    }
  );

  const docs = await loader.load();

//   console.log("🔈 Hindi Transcription Output:");
  console.dir(docs, { depth: Infinity });

  // Use Google Gemini for summarization
  const model = new ChatGoogleGenerativeAI({
    model: "gemini-1.5-flash",
    temperature: 0,
    apiKey: process.env.GOOGLE_API_KEY,
  });

  const transcription = docs.map((doc) => doc.pageContent).join(" ");
  const summary = await model.invoke(
    `Summarize this transcript in a few bullet points:\n${transcription}\nDisplay Summary`
  );

  console.log("📘 Summary:");
  console.log(summary);

};
