import express from "express";
import multer from "multer";
import { loadPDF } from "./src/pdfLoader/pdfLoader.js";
import { initializeRagChain } from "./src/langRag/rag.js";

const app = express();
const upload = multer({ dest: "uploads/" });

let docs = [];
let ragChain = null;

app.post("/upload", upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) {
      console.error("No file uploaded.");
      return res.status(400).send("No file uploaded. Please upload a PDF file.");
    }

    const filePath = req.file.path;
    console.log("Uploaded file path:", filePath);

    docs = await loadPDF(filePath);
    if (!docs || docs.length === 0) {
      console.error("No text extracted from the uploaded PDF.");
      return res.status(400).send("The uploaded PDF contains no readable text.");
    }

    console.log("Extracted documents:", docs);

    ragChain = await initializeRagChain(docs);
    console.log("RAG chain initialized successfully.");

    res.json({ message: "PDF uploaded and processed successfully." });
  } catch (error) {
    console.error("Error processing the PDF:", error);
    res.status(500).send("Error processing the PDF");
  }
});

app.post("/question", express.json(), async (req, res) => {
  try {
    if (!ragChain) {
      console.error("No RAG chain initialized. Upload a PDF first.");
      return res.status(400).send("No PDF has been uploaded yet.");
    }

    const { question } = req.body;
    if (!question) {
      console.error("No question provided in the request.");
      return res.status(400).send("Question is required.");
    }

    console.log("Received question:", question);

    const results = await ragChain.invoke({ input: question });
    console.log("Question results:", results);

    res.json({ answer: results.answer });
  } catch (error) {
    console.error("Error processing the question:", error);
    res.status(500).send("Error processing the question");
  }
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
