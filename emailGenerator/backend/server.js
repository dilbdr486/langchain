import express, { json } from "express";
import dotenv from "dotenv";
import { generateEmail } from "./src/generateEmail.js";

dotenv.config();

const app = express();
app.use(json());

const port = process.env.PORT;

// API to generate an email
app.post("/api/generate-email", generateEmail);

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
