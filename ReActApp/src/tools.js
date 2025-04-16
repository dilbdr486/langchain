import { tool } from "@langchain/core/tools";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { model } from "./model.js";
import { z } from "zod";

export const frnds = async () => {
  const frndSchema = z.object({
    name: z.string().describe("Friend's name"),
  });

  const data = [
    {
      name: "Sanjeeb",
      email: "sanjeeb@gmail.com",
      address: "Chapagaun",
      status: "jhiskaune manxe",
    },
    {
      name: "Puran",
      email: "puran@gmail.com",
      address: "sanothimi",
      status: "tarif garne manxe",
    },
    {
      name: "Nikesh",
      email: "nikesh@gmail.com",
      address: "kalanki",
      status: "henoni manxe",
    },
    {
      name: "Anuja",
      email: "anuja@gmail.com",
      address: "sankhamul",
      status: "cute manxe",
    },
  ];

  const frndTool = new tool(
    async ({ name }) => {
      const friend = data.find(
        (f) => f.name.toLowerCase() === name.toLowerCase()
      );
      if (!friend) {
        return `Sorry, I couldn't find any friend named "${name}".`;
      }
      return `${friend.name} lives in ${friend.address}, his/her email is ${friend.email}, and he/she known as "${friend.status}".`;
    },
    {
      name: "frndTool",
      description: "Use this tool to get details about a friend if the user asks about someone by name.",
      schema: frndSchema,
    }
  );

  const agent = createReactAgent({
    llm: model,
    tools: [frndTool],
  });

  const result = await agent.invoke({
    messages: [
      {
        role: "user",
        content: "who is Anuja?",
      },
    ],
  });

  console.log(result.messages.at(-1).content);
};
