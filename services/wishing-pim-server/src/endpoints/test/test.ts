import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { Context } from "hono";

type AppContext = Context<{ Bindings: Env }>;

// Counter Durable Object 测试端点
export class Counter extends OpenAPIRoute {
  schema = {
    tags: ["Test"],
    summary: "测试 Durable Object Counter",
    description: "测试 Cloudflare Durable Object 的 Counter 类功能",
    request: {
      body: {
        content: {
          "application/json": {
            schema: z.object({
              action: z.enum(["increment", "decrement", "get"]),
              amount: z.number().optional(),
              name: z.string().optional(),
            }),
          },
        },
      },
    },
    responses: {
      "200": {
        description: "Counter操作结果",
        content: {
          "application/json": {
            schema: z.object({
              success: z.boolean(),
              value: z.number(),
              action: z.string(),
            }),
          },
        },
      },
    },
  };

  async handle(c: AppContext) {
    const data = await this.getValidatedData<typeof this.schema>();
    const { action, amount = 1, name = "default" } = data.body;
    
    // 创建一个唯一的 Durable Object ID
    // 如果提供了name参数，则使用name作为ID的一部分，这样可以创建多个不同的计数器
    const id = c.env.COUNTER.idFromName(name);
    
    // 获取 Durable Object 实例的存根
    const counterObj = c.env.COUNTER.get(id);
    
    let value: number;
    
    // 根据请求的操作类型调用相应的方法
    switch (action) {
      case "increment":
        value = await counterObj.fetch(
          new Request("https://dummy-url/increment", {
            method: "POST",
            body: JSON.stringify({ amount }),
          })
        ).then(res => res.json())
          .then(data => typeof data === 'object' && data !== null ? (data as {value: number}).value : 0);
        break;
      case "decrement":
        value = await counterObj.fetch(
          new Request("https://dummy-url/decrement", {
            method: "POST",
            body: JSON.stringify({ amount }),
          })
        ).then(res => res.json())
          .then(data => typeof data === 'object' && data !== null ? (data as {value: number}).value : 0);
        break;
      case "get":
      default:
        value = await counterObj.fetch(
          new Request("https://dummy-url/get")
        ).then(res => res.json())
          .then(data => typeof data === 'object' && data !== null ? (data as {value: number}).value : 0);
        break;
    }
    
    return c.json({
      success: true,
      value,
      action,
    });
  }
}