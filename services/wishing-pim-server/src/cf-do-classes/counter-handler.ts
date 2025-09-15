import { Counter } from './task';

/**
 * 处理来自API端点的Counter Durable Object请求
 */
export class CounterHandler {
  /**
   * 处理请求并调用相应的Counter方法
   * @param request 请求对象
   * @param counter Counter Durable Object实例
   * @returns 响应对象
   */
  static async handleRequest(request: Request, counter: Counter): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname.split('/').pop();
    
    let value: number;
    let responseData: any = {};
    
    try {
      switch (path) {
        case 'increment': {
          const { amount = 1 } = await request.json<{ amount?: number }>();
          value = await counter.increment(amount);
          responseData = { value, action: 'increment' };
          break;
        }
        case 'decrement': {
          const { amount = 1 } = await request.json<{ amount?: number }>();
          value = await counter.decrement(amount);
          responseData = { value, action: 'decrement' };
          break;
        }
        case 'get':
        default:
          value = await counter.getCounterValue();
          responseData = { value, action: 'get' };
          break;
      }
      
      return new Response(JSON.stringify(responseData), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return new Response(JSON.stringify({ error: errorMessage }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }
}