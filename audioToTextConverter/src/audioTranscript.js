import {
  AudioTranscriptLoader,
  // AudioTranscriptParagraphsLoader,
  // AudioTranscriptSentencesLoader
} from "@langchain/community/document_loaders/web/assemblyai";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai"; // Import Google Gemini model
import {ElevenLabsClient} from "elevenlabs"
import { v4 as uuidv4} from 'uuid'

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
  // console.dir(docs, { depth: Infinity });

  // Use Google Gemini for summarization
  const model = new ChatGoogleGenerativeAI({
    model: "gemini-1.5-flash",
    temperature: 0,
    apiKey: process.env.GOOGLE_API_KEY,
  });

  const transcription = docs.map((doc) => doc.pageContent).join(" ");
  const summary = await model.invoke(
    `Summarize this transcript about 100 words.\n${transcription}\nDisplay Summary`
  );

  // console.log("📘 Summary:");
  console.log(summary.content);
  const client = new ElevenLabsClient({
    apiKey: process.env.ELEVEN_LABS_API_KEY,
  });
  const ttsResponse = await client.textToSpeech.convert(
    "JBFqnCBsd6RMkjVDRZzb",
    {
      output_format: "mp3_44100_128",
      text: summary.content,
      model_id: "eleven_multilingual_v2",
    }
  );
  // Save the audio to disk
  const audioFileName = `summary-${uuidv4()}.mp3`;
  const audioFilePath = path.join("uploads", audioFileName); // ensure "uploads/" exists
  const writeStream = fs.createWriteStream(audioFilePath);
  ttsResponse.pipe(writeStream);

  writeStream.on("finish", () => {
    // Response after audio is saved
    console.log("tts successful")
  });
};
