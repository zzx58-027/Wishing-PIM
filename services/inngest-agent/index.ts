import { createServer } from '@inngest/agent-kit/server';
import { createAgent } from "@inngest/agent-kit";
import { openai } from "@inngest/agent-kit";

export const siliconFlow = {
  "deepseek-v3": openai({
    model: "deepseek-ai/DeepSeek-V3",
    apiKey: "sk-skqsrqmaqegbqugvsaxlkoxfnwhcdggugubkquclmdwgvgdn",
    baseUrl: "https://api.siliconflow.cn",
    defaultParameters: {
      temperature: 0.5,
    },
  }),
};

const agent = createAgent({
  name: "silicon-flow/deepseek-v3",
  system: "You are a helpful assistant",
  model: siliconFlow["deepseek-v3"],
});


const server = createServer({
  agents: [agent],
});
server.listen(3000, () => console.log('AgentKit server running!'));