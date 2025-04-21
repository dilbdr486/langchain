import mongoose from "mongoose";

const tokenLogSchema = new mongoose.Schema({
  message: { type: String, required: true },
  input_tokens: { type: Number, required: true },
  ai_response: { type: String, required: true },
  output_tokens: { type: Number, required: true },
  created_at: { type: Date, default: Date.now },
});

export const tokenLog = mongoose.model("TokenLog", tokenLogSchema);
