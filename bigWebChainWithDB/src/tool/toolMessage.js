import { AIMessage, HumanMessage, SystemMessage, ToolMessage } from "@langchain/core/messages";
import { model } from "../geminiAI/gemini.js";
import { retrieve } from "./toolRetriever.js";
import { ToolNode } from "@langchain/langgraph/prebuilt";

export async function queryOrRespond(state) {
  const llmWithTools = model.bindTools([retrieve]);
  const response = await llmWithTools.invoke(state.messages);
  return { messages: [response] };
}

// Step 2: Execute the retrieval.
export const tools = new ToolNode([retrieve]);

// Step 3: Generate a response using the retrieved content.
export async function generate(state) {
  let recentToolMessages = [];

  // Step 1: Collect recent ToolMessages (from the retrieve tool)
  for (let i = state.messages.length - 1; i >= 0; i--) {
    let message = state.messages[i];
    if (message instanceof ToolMessage) {
      recentToolMessages.push(message);
    } else {
      break;
    }
  }

  const toolMessages = recentToolMessages.reverse();
  const docsContent = toolMessages.map((doc) => doc.content).join("\n");

  const systemMessageContent = `
    You are an assistant for question-answering tasks.
    Use the following pieces of retrieved context to answer the question.
    If you don't know the answer, say that you don't know.
    Use three sentences maximum and keep the answer concise.

    ${docsContent}
  `.trim();

  // Step 2: Collect relevant conversation messages
  const conversationMessages = state.messages.filter(
    (message) =>
      message instanceof HumanMessage ||
      message instanceof SystemMessage ||
      (message instanceof AIMessage && message.tool_calls.length === 0)
  );

  // ❗️Check if we have at least one valid user message
  if (conversationMessages.length === 0) {
    throw new Error("No valid conversation messages found to generate a prompt.");
  }

  // Step 3: Create full prompt
  const prompt = [
    new SystemMessage(systemMessageContent),
    ...conversationMessages,
  ];

  // Log the prompt for debugging
  console.log("Prompt being sent to Gemini:", prompt);

  // Step 4: Invoke Gemini model
  const response = await model.invoke(prompt);

  return { messages: [response] };
}

