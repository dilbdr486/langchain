import {
    AIMessage,
    HumanMessage,
    SystemMessage,
    ToolMessage,
} from "@langchain/core/messages";
import { model } from "../geminiAI/gemini.js";
import { retrieve } from "./toolRetriever.js"; // Ensure retrieve is imported correctly

export async function queryOrRespond(state) {
    // Retrieve context from ChromaDB
    const query = state.messages[state.messages.length - 1]?.content || "";
    console.log("Query for ChromaDB retrieval:", query);

    const [retrievedContext] = await retrieve({ query });
    console.log("Retrieved Context from ChromaDB:", retrievedContext);

    // Build system message with retrieved context
    const systemMessageContent =
        "You are an assistant for question-answering tasks. " +
        "Use the following pieces of retrieved context to answer " +
        "the question. If you don't know the answer, say that you " +
        "if can not find the answer from chromadb then say that i don't know. " +
        "Use three sentences maximum and keep the answer concise." +
        "\n\n" +
        `${retrievedContext}`;

    const conversationMessages = state.messages.filter(
        (message) =>
            message instanceof HumanMessage ||
            message instanceof SystemMessage ||
            (message instanceof AIMessage && message.tool_calls.length === 0)
    );

    const prompt = [
        new SystemMessage(systemMessageContent),
        ...conversationMessages,
    ];

    console.log("Prompt passed to AI model:", prompt);

    // Invoke the AI model with the prompt
    const response = await model.invoke(prompt);
    return { messages: [response] };
}

export async function generate(state) {
    let recentToolMessages = [];
    for (let i = state["messages"].length - 1; i >= 0; i--) {
        let message = state["messages"][i];
        if (message instanceof ToolMessage) {
            recentToolMessages.push(message);
        } else {
            break;
        }
    }
    let toolMessages = recentToolMessages.reverse();

    const docsContent = toolMessages.map((doc) => doc.content).join("\n");
    const systemMessageContent =
        "You are an assistant for question-answering tasks. " +
        "Use the following pieces of retrieved context to answer " +
        "the question. If you don't know the answer, say that you " +
        "if can not find the answer from chromadb then say that i don't know"+
        "don't know. Use three sentences maximum and keep the " +
        "answer concise." +
        "\n\n" +
        `${docsContent}`;

    const conversationMessages = state.messages.filter(
        (message) =>
            message instanceof HumanMessage ||
            message instanceof SystemMessage ||
            (message instanceof AIMessage && message.tool_calls.length === 0)
    );
    const prompt = [
        new SystemMessage(systemMessageContent),
        ...conversationMessages,
    ];

    console.log("Prompt passed to AI model:", prompt);

    const response = await model.invoke(prompt);
    return { messages: [response] };
}
