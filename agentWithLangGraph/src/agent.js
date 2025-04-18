import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { MessagesAnnotation, StateGraph } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import path from "node:path";

export const agentTools = async () => {
  const agentTools = [
    new TavilySearchResults({
      maxResults: 3,
      apiKey: process.env.TAVILY_API_KEY,
    }),
  ];

  const toolNode = new ToolNode(agentTools);

  const model = new ChatGoogleGenerativeAI({
    model: "gemini-1.5-flash",
    apiKey: process.env.GOOGLE_API_KEY,
  }).bindTools(agentTools);

  function shouldContinue(state) {
    const lastMessage = state.messages[state.messages.length - 1];
    if (lastMessage.tool_calls?.length) {
      return "tools";
    }
    return "__end__";
  }

  async function callModel(state) {
    const response = await model.invoke(state.messages);
    return { messages: [response] };
  }

  const workflow = new StateGraph(MessagesAnnotation)
    .addNode("agent", callModel)
    .addEdge("__start__", "agent")
    .addNode("tools", toolNode)
    .addEdge("tools", "agent")
    .addConditionalEdges("agent", shouldContinue);

  // ✅ Correct way to get DOT format
  const dot = workflow.graph.toDot();

  const dotFilePath = path.join(process.cwd(), "graph.dot");
  writeFileSync(dotFilePath, dot);

  const pngFilePath = path.join(process.cwd(), "graph.png");
  execSync(`dot -Tpng "${dotFilePath}" -o "${pngFilePath}"`);
  console.log(`Graph image saved to: ${pngFilePath}`);

  const agent = workflow.compile();

  const finalAgentState = await agent.invoke(
    {
      messages: [
        {
          role: "user",
          content: "what is the capital of nepal?",
        },
      ],
    },
    { configurable: { thread_id: "42" } }
  );

  console.log(finalAgentState.messages.at(-1).content);
};

agentTools().catch(console.error);
