import express from "express";
import "dotenv/config";
import { generateCaptionForLocalImage } from "./src/imageUpload.js";

const app = express();

const port = process.env.PORT;


const generateCaptionOnStartup = async () => {
  try {
    const caption = await generateCaptionForLocalImage();
    console.log("Generated Caption on Startup:", caption);
  } catch (error) {
    console.error("Error generating caption on startup:", error);
  }
};

generateCaptionOnStartup();

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});