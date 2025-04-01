import { createRetrievalChain } from "langchain/chains/retrieval";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { retriever, model, updateDocs } from "../gemini/gemini.js";

const systemTemplate = [
    `You are an assistant for question-answering tasks. `,
    `Use the following pieces of retrieved context to answer `,
    `the question. If you don't know the answer, say that you `,
    `the content does not contain the answer or that you `,
    `don't know. Use three sentences maximum and keep the `,
    `answer concise.`,
    `\n\n`,
    `{context}`,
].join("");

const prompt = ChatPromptTemplate.fromMessages([
    ["system", systemTemplate],
    ["human", "{input}"],
]);

async function initializeRagChain(docs) {
    await updateDocs(docs);

    const questionAnswerChain = await createStuffDocumentsChain({ llm: model, prompt });
    const ragChain = await createRetrievalChain({
        retriever,
        combineDocsChain: questionAnswerChain,
    });

    return ragChain;
}

export { initializeRagChain };