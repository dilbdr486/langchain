// gemini.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();


const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);


function bufferToBase64(buffer) {
  return buffer.toString("base64");
}

export async function generateCaption(imageBuffer) {
  try {
    const base64Image = bufferToBase64(imageBuffer);

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Image,
        },
      },
      "You are a photo captioning assistant. Generate a creative one-liner caption for the given image, along with the image name. Only output the caption and the name, no explanations and also describe the given image.",
    ]);

    const response = await result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error("Gemini error:", error);
    throw error;
  }
}
