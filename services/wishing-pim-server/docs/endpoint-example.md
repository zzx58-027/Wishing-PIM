# 端点添加示例

本文档展示如何使用新的路由管理系统添加端点。

## 示例：添加用户管理端点

### 1. 创建端点实现

**文件：`src/endpoints/user/getProfile.ts`**
```typescript
import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { Context } from "hono";

type AppContext = Context<{ Bindings: Env }>;

export class GetUserProfile extends OpenAPIRoute {
  schema = {
    tags: ["User"],
    summary: "Get user profile information.",
    request: {
      params: z.object({
        userId: z.string().min(1),
      }),
    },
    responses: {
      "200": {
        description: "User profile information.",
        content: {
          "application/json": {
            schema: z.object({
              id: z.string(),
              name: z.string(),
              email: z.string().email(),
              createdAt: z.string(),
            }),
          },
        },
      },
    },
  };

  async handle(c: AppContext) {
    const { userId } = this.getValidatedData<typeof this.schema>().params;
    
    // 模拟获取用户信息
    const userProfile = {
      id: userId,
      name: "John Doe",
      email: "john@example.com",
      createdAt: new Date().toISOString(),
    };

    return c.json(userProfile);
  }
}
```

**文件：`src/endpoints/user/updateProfile.ts`**
```typescript
import { OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { Context } from "hono";

type AppContext = Context<{ Bindings: Env }>;

export class UpdateUserProfile extends OpenAPIRoute {
  schema = {
    tags: ["User"],
    summary: "Update user profile information.",
    request: {
      params: z.object({
        userId: z.string().min(1),
      }),
      body: {
        content: {
          "application/json": {
            schema: z.object({
              name: z.string().optional(),
              email: z.string().email().optional(),
            }),
          },
        },
      },
    },
    responses: {
      "200": {
        description: "Updated user profile.",
        content: {
          "application/json": {
            schema: z.object({
              success: z.boolean(),
              message: z.string(),
            }),
          },
        },
      },
    },
  };

  async handle(c: AppContext) {
    const { userId } = this.getValidatedData<typeof this.schema>().params;
    const updateData = this.getValidatedData<typeof this.schema>().body;
    
    // 模拟更新用户信息
    console.log(`Updating user ${userId} with:`, updateData);

    return c.json({
      success: true,
      message: "Profile updated successfully",
    });
  }
}
```

### 2. 创建端点导出文件

**文件：`src/endpoints/user/index.ts`**
```typescript
export * from "./getProfile";
export * from "./updateProfile";
```

### 3. 更新路由配置

**文件：`src/routes/index.ts`**
```typescript
import { RouteGroup } from '../utils/routeManager';
import * as pooleFtpEndpoints from '../endpoints/poole-ftp/index';
import * as userEndpoints from '../endpoints/user/index'; // 新增导入

export const routeGroups: RouteGroup[] = [
  {
    prefix: '/poole-ftp',
    routes: [
      {
        path: '/get-files-list',
        method: 'post',
        handler: pooleFtpEndpoints.GetFilesList
      },
      {
        path: '/get-files-download-url',
        method: 'post',
        handler: pooleFtpEndpoints.GetFilesDownloadUrl
      }
    ]
  },
  // 新增用户路由组
  {
    prefix: '/user',
    routes: [
      {
        path: '/:userId/profile',
        method: 'get',
        handler: userEndpoints.GetUserProfile
      },
      {
        path: '/:userId/profile',
        method: 'put',
        handler: userEndpoints.UpdateUserProfile
      }
    ]
  }
];

// 更新路由元数据
export const routeMetadata = {
  '/poole-ftp': {
    description: 'Poole FTP 相关接口',
    version: '1.0.0',
    tags: ['Poole-FTP']
  },
  '/user': {
    description: '用户管理相关接口',
    version: '1.0.0',
    tags: ['User']
  }
};
```

### 4. 测试新端点

启动服务器后，新的端点将自动注册：

```
📋 Registered Routes:
==================================================

📂 poole-ftp:
  POST   /poole-ftp/get-files-list
  POST   /poole-ftp/get-files-download-url

📂 user:
  GET    /user/:userId/profile
  PUT    /user/:userId/profile

==================================================

📊 Route Statistics: {
  totalGroups: 2,
  totalRoutes: 4,
  groupRoutes: 4,
  standaloneRoutes: 0
}
```

### 5. API 使用示例

**获取用户信息：**
```bash
curl -X GET "http://localhost:8787/user/123/profile"
```

**更新用户信息：**
```bash
curl -X PUT "http://localhost:8787/user/123/profile" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "jane@example.com"
  }'
```

## 添加中间件示例

### 1. 创建认证中间件

**文件：`src/middleware/auth.ts`**
```typescript
import { Context, Next } from 'hono';

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  // 验证 token 逻辑
  const token = authHeader.substring(7);
  if (token !== 'valid-token') {
    return c.json({ error: 'Invalid token' }, 401);
  }
  
  await next();
}
```

### 2. 应用中间件到路由组

```typescript
import { authMiddleware } from '../middleware/auth';

export const routeGroups: RouteGroup[] = [
  // ... 其他路由组
  {
    prefix: '/user',
    routes: [
      {
        path: '/:userId/profile',
        method: 'get',
        handler: userEndpoints.GetUserProfile
      },
      {
        path: '/:userId/profile',
        method: 'put',
        handler: userEndpoints.UpdateUserProfile
      }
    ],
    middleware: [authMiddleware] // 应用到整个用户路由组
  }
];
```

## 总结

通过以上步骤，你可以：

1. ✅ 创建新的端点实现
2. ✅ 组织端点文件结构
3. ✅ 配置路由映射
4. ✅ 添加中间件保护
5. ✅ 自动获得路由统计和文档

这种方式让端点管理变得简单、有序且易于维护。