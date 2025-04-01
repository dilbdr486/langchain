import fs from "fs/promises";
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";

async function loadPDF(filePath) {
  try {
    const buffer = await fs.readFile(filePath);
    const pdfBlob = new Blob([buffer], { type: "application/pdf" });

    const loader = new WebPDFLoader(pdfBlob, {
      splitPages: true,
    });

    const docs = await loader.load();
    if (!docs || docs.length === 0) {
      throw new Error("No text could be extracted from the PDF.");
    }

    console.log("Extracted Documents (Editable PDF):", docs);
    return docs;
  } catch (error) {
    console.error("Error loading PDF:", error);
    throw error;
  }
}

export { loadPDF };
