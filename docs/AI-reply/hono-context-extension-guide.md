# Hono Context 扩展指南：挂载外部工具对象

## 概述

在 Hono 框架中，有多种方式可以将外部工具对象挂载到 context 上下文中，使其在整个请求生命周期内可用。本文档将详细介绍几种主要的实现方式。

## 方法一：通过 Variables 类型扩展（推荐）

### 1. 定义 Context 类型

```typescript
import { Context } from "hono";

// 定义自定义的 Variables 接口
interface Variables {
  myTool: MyExternalTool;
  database: DatabaseClient;
  logger: Logger;
}

// 扩展 Context 类型
type AppContext = Context<{
  Bindings: Env;  // Cloudflare Workers 环境变量
  Variables: Variables;  // 自定义变量
}>;
```

### 2. 创建中间件挂载工具

```typescript
import { Hono } from "hono";

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

// 中间件：挂载外部工具到 context
app.use("*", async (c, next) => {
  // 初始化外部工具
  const myTool = new MyExternalTool({
    apiKey: c.env.API_KEY,
    baseUrl: c.env.BASE_URL
  });
  
  const database = new DatabaseClient(c.env.DATABASE_URL);
  const logger = new Logger({ level: "info" });
  
  // 挂载到 context variables
  c.set("myTool", myTool);
  c.set("database", database);
  c.set("logger", logger);
  
  await next();
});
```

### 3. 在路由处理器中使用

```typescript
import { OpenAPIRoute } from "chanfana";

export class MyEndpoint extends OpenAPIRoute {
  async handle(c: AppContext) {
    // 从 context 获取工具对象
    const myTool = c.get("myTool");
    const database = c.get("database");
    const logger = c.get("logger");
    
    // 使用工具对象
    const result = await myTool.doSomething();
    await database.save(result);
    logger.info("Operation completed");
    
    return { success: true, data: result };
  }
}
```

## 方法二：全局变量 + 中间件设置（当前项目使用）

### 实现示例

```typescript
// api/methods/poole-ftp.ts
import { Context } from "hono";
import { createAlova } from "alova";

// 全局变量存储当前上下文
let honoCtx: Context<{ Bindings: Env }> | null = null;

// 设置上下文的函数
export const setPooleFTPServiceContext = (c: Context<{ Bindings: Env }>) => {
  honoCtx = c;
};

// 创建工具实例，使用延迟初始化
const pooleFTPAlova = createAlova({
  baseURL: "https://api.example.com",
  requestAdapter: adapterFetch(),
  beforeRequest: async (method) => {
    // 在请求前从全局上下文获取认证信息
    const token = await honoCtx?.env.KV.get("user_token");
    if (token) {
      method.config.headers.Authorization = `Bearer ${token}`;
    }
  }
});

// main.ts
app.use("*", async (c, next) => {
  setPooleFTPServiceContext(c);
  await next();
});
```

### 优缺点分析

**优点：**
- 实现简单，无需复杂的类型定义
- 适合快速原型开发

**缺点：**
- 全局变量可能导致并发问题
- 类型安全性较差
- 不符合函数式编程原则

## 方法三：依赖注入模式

### 1. 创建服务容器

```typescript
// services/container.ts
export class ServiceContainer {
  private services = new Map<string, any>();
  
  register<T>(name: string, service: T): void {
    this.services.set(name, service);
  }
  
  get<T>(name: string): T {
    const service = this.services.get(name);
    if (!service) {
      throw new Error(`Service ${name} not found`);
    }
    return service as T;
  }
}

// 创建全局容器实例
export const container = new ServiceContainer();
```

### 2. 注册服务

```typescript
// main.ts
import { container } from "./services/container";

app.use("*", async (c, next) => {
  // 注册服务到容器
  container.register("database", new DatabaseClient(c.env.DATABASE_URL));
  container.register("logger", new Logger());
  container.register("externalAPI", new ExternalAPIClient(c.env.API_KEY));
  
  // 将容器挂载到 context
  c.set("container", container);
  
  await next();
});
```

### 3. 使用服务

```typescript
export class MyEndpoint extends OpenAPIRoute {
  async handle(c: AppContext) {
    const container = c.get("container") as ServiceContainer;
    
    const database = container.get<DatabaseClient>("database");
    const logger = container.get<Logger>("logger");
    
    // 使用服务...
  }
}
```

## 方法四：工厂函数模式

### 实现示例

```typescript
// utils/context-factory.ts
export interface AppServices {
  database: DatabaseClient;
  logger: Logger;
  externalAPI: ExternalAPIClient;
}

export function createAppServices(env: Env): AppServices {
  return {
    database: new DatabaseClient(env.DATABASE_URL),
    logger: new Logger({ level: env.LOG_LEVEL }),
    externalAPI: new ExternalAPIClient(env.API_KEY)
  };
}

// 扩展 Context 类型
type AppContext = Context<{
  Bindings: Env;
  Variables: {
    services: AppServices;
  };
}>;
```

### 中间件实现

```typescript
app.use("*", async (c, next) => {
  const services = createAppServices(c.env);
  c.set("services", services);
  await next();
});
```

## 最佳实践建议

### 1. 类型安全

```typescript
// 创建类型安全的 getter 函数
function getService<K extends keyof AppServices>(
  c: AppContext,
  serviceName: K
): AppServices[K] {
  const services = c.get("services");
  return services[serviceName];
}

// 使用
const database = getService(c, "database"); // 类型安全
```

### 2. 错误处理

```typescript
app.use("*", async (c, next) => {
  try {
    const services = createAppServices(c.env);
    c.set("services", services);
    await next();
  } catch (error) {
    console.error("Failed to initialize services:", error);
    return c.json({ error: "Service initialization failed" }, 500);
  }
});
```

### 3. 生命周期管理

```typescript
app.use("*", async (c, next) => {
  const services = createAppServices(c.env);
  c.set("services", services);
  
  try {
    await next();
  } finally {
    // 清理资源
    await services.database.close();
  }
});
```

## 性能考虑

### 1. 单例模式

对于无状态的服务，考虑使用单例模式：

```typescript
class ServiceManager {
  private static instances = new Map<string, any>();
  
  static getInstance<T>(key: string, factory: () => T): T {
    if (!this.instances.has(key)) {
      this.instances.set(key, factory());
    }
    return this.instances.get(key) as T;
  }
}
```

### 2. 懒加载

```typescript
interface LazyServices {
  get database(): DatabaseClient;
  get logger(): Logger;
}

function createLazyServices(env: Env): LazyServices {
  let _database: DatabaseClient | null = null;
  let _logger: Logger | null = null;
  
  return {
    get database() {
      if (!_database) {
        _database = new DatabaseClient(env.DATABASE_URL);
      }
      return _database;
    },
    get logger() {
      if (!_logger) {
        _logger = new Logger();
      }
      return _logger;
    }
  };
}
```

## 总结

1. **推荐使用方法一（Variables 扩展）**：类型安全，符合 Hono 设计理念
2. **避免全局变量**：除非有特殊需求，否则不推荐方法二
3. **考虑依赖注入**：对于复杂应用，方法三提供了更好的可测试性
4. **工厂函数模式**：适合中等复杂度的应用
5. **注意性能**：合理使用单例和懒加载优化性能
6. **错误处理**：始终考虑服务初始化失败的情况

选择合适的方法取决于你的具体需求、团队偏好和项目复杂度。对于大多数情况，推荐使用 Variables 扩展的方式，它提供了最好的类型安全性和开发体验。