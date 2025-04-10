// imageUpload.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { generateCaption } from "./gemini.js";

export const generateCaptionForLocalImage = async () => {
  try {
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const imagePath = path.resolve(__dirname, "pic.jpeg"); 

    
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Image file not found at path: ${imagePath}`);
    }

    
    const imageData = fs.readFileSync(imagePath);

    
    const caption = await generateCaption(imageData);

    // console.log("Generated caption:", caption);
    return caption;
  } catch (error) {
    console.error("Error in generating caption for the image:", error);
    throw error;
  }
};
