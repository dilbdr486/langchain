import express from "express";
import dotenv from "dotenv";
import { processAndStoreWebContent } from "./src/chunks/splitterChain.js";
import { queryOrRespond } from "./src/tool/toolMessage.js";
import { HumanMessage } from "@langchain/core/messages";
import { encode, decode } from "gpt-3-encoder";
import { tokenLog } from "./src/models/tokenModel.js";
import { connectDb } from "./src/config/db.js";

const app = express();
dotenv.config();

app.use(express.json());

app.post("/api/load-data", async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    console.log(`Processing and storing web content from ${url}...`);
    const storedData = await processAndStoreWebContent(url);

    console.log("Stored Data:", storedData);
    res.status(200).json({
      message: "Data successfully loaded into WeaviateDB",
      storedData,
      tagCounts: storedData.tagCounts,
    });
  } catch (error) {
    console.error("Error processing and storing web content:", error);
    res.status(500).json({ error: "Failed to load data into ChromaDB" });
  }
});

connectDb();

const MAX_QUERY_TOKENS = 100;
const MAX_RESPONSE_TOKENS = 2000;

app.post("/api/query", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    console.log(`User Query: ${message}`);

    const queryTokens = encode(message);
    const queryTokenCount = queryTokens.length;

    if (queryTokenCount > MAX_QUERY_TOKENS) {
      return res.status(400).json({
        error: `Query too long (${queryTokenCount} tokens). Max allowed: ${MAX_QUERY_TOKENS}`,
      });
    }

    const inputs = { messages: [new HumanMessage(message)] };
    const response = await queryOrRespond(inputs);

    const aiMessage = response.messages[0]?.content || "No response from AI";
    const responseTokens = encode(aiMessage);
    const responseTokenCount = responseTokens.length;

    let finalResponse = aiMessage;

    if (responseTokenCount > MAX_RESPONSE_TOKENS) {
      const trimmedTokens = responseTokens.slice(0, MAX_RESPONSE_TOKENS);
      finalResponse = decode(trimmedTokens) + "\n\n[Response truncated]";
    }

    // ✅ Token and Cost Calculations
    const totalTokens = queryTokenCount + responseTokenCount;

    const COST_PER_INPUT_TOKEN = 2;
    const COST_PER_OUTPUT_TOKEN = 3;

    const inputCost = queryTokenCount * COST_PER_INPUT_TOKEN;
    const outputCost = responseTokenCount * COST_PER_OUTPUT_TOKEN;
    const totalCost = inputCost + outputCost;

    // ✅ Save to MongoDB
    await tokenLog.create({
      message,
      input_tokens: queryTokenCount,
      ai_response: finalResponse,
      output_tokens: responseTokenCount,
      total_tokens: totalTokens,
      cost: totalCost,
    });

    // ✅ Aggregate overall token usage
    const tokenSums = await tokenLog.aggregate([
      {
        $group: {
          _id: null,
          total_input_tokens: { $sum: "$input_tokens" },
          total_output_tokens: { $sum: "$output_tokens" },
        },
      },
    ]);

    const totalInputTokenSum = tokenSums[0]?.total_input_tokens || 0;
    const totalOutputTokenSum = tokenSums[0]?.total_output_tokens || 0;
    const totalCombinedTokens = totalInputTokenSum + totalOutputTokenSum;
    const totalSpentCost =
      totalInputTokenSum * COST_PER_INPUT_TOKEN +
      totalOutputTokenSum * COST_PER_OUTPUT_TOKEN;

    // ✅ Final Response
    res.status(200).json({
      response: finalResponse,
      token_stats: {
        input_tokens: queryTokenCount,
        output_tokens: responseTokenCount,
        total_tokens: totalTokens,
      },
      cost: {
        input_cost: `Rs ${inputCost.toFixed(4)}`,
        output_cost: `Rs ${outputCost.toFixed(4)}`,
        total_cost: `Rs ${totalCost.toFixed(4)}`,
      },
      token_sums_overall: {
        total_input_tokens: totalInputTokenSum,
        total_output_tokens: totalOutputTokenSum,
        total_combined_tokens: totalCombinedTokens,
        total_cost_spent: totalSpentCost,
      },
    });
  } catch (error) {
    console.error("Error handling human message query:", error);
    res.status(500).json({ error: "Failed to process the query" });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
