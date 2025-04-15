import { model } from "../geminiAI/gemini.js"; // LLM model
import { retrieve } from "./toolRetriever.js"; // Tool function
import { SystemMessage, HumanMessage } from "@langchain/core/messages"; // ✅ Chat message classes

export const queryOrRespond = async (message) => {
  if (!message) {
    throw new Error("Message content is empty or invalid");
  }

  // 🔍 Retrieve context using the tool
  const queryResponse = await retrieve.invoke({ query: message });
  console.log("Query response from the tool:", queryResponse.content);

  if (!queryResponse.content) {
    const fallbackResponse = await model.invoke(
      [new HumanMessage(`I don't have relevant information for "${message}". Please provide a general response.`)]
    );
    return fallbackResponse;
  }

  // 🧠 Construct system + user message for contextual answer
  const systemMessageContent =
    "You are an assistant for question-answering tasks. " +
    "Use the following pieces of retrieved context to answer the question. " +
    "If you don't know the answer, say that you don't know. " +
    "Use three sentences maximum and keep the answer concise." +
    "\n\n" +
    queryResponse.content;

  const finalResponse = await model.invoke([
    new SystemMessage(systemMessageContent),
    new HumanMessage(message),
  ]);

  return finalResponse;
};
