import { DurableObject } from "cloudflare:workers";

export class Counter extends DurableObject<Env> {
  // 内存缓存，避免每次读存储
  value = 0;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    // 初始化时把持久化值读到内存
    // 使用 blockConcurrencyWhile 确保初始化时的并发安全
    ctx.blockConcurrencyWhile(async () => {
      this.value = (await ctx.storage.get<number>("value")) || 0;
    });
  }

  // 处理来自API的请求
  async fetch(request: Request): Promise<Response> {
    const { CounterHandler } = await import('./counter-handler');
    return CounterHandler.handleRequest(request, this);
  }

  // 三个业务方法
  async getCounterValue() {
    return this.value;
  }

  async increment(amount = 1) {
    this.value += amount;
    await this.ctx.storage.put("value", this.value);
    return this.value;
  }

  async decrement(amount = 1) {
    this.value -= amount;
    await this.ctx.storage.put("value", this.value);
    return this.value;
  }
}
