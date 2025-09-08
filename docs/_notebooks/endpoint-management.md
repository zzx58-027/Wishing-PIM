# 端点管理指南

## 概述

当项目中的API端点数量增多时，手动在主入口文件中逐个注册路由会变得难以维护。本项目采用了模块化的路由管理方案，提供了更好的组织结构和可维护性。

## 当前问题

### 原有方式的问题

```typescript
// 在 index.ts 中手动注册每个端点
openapi.post("/poole-ftp/get-files-list", pooleFtpEndpoints.GetFilesList);
openapi.post("/poole-ftp/get-files-download-url", pooleFtpEndpoints.GetFilesDownloadUrl);
// ... 更多端点需要手动添加
```

**问题：**
- 主入口文件会变得越来越长
- 路由分散，难以统一管理
- 容易出现重复路由或路径冲突
- 缺乏路由的统一配置和中间件管理
- 难以进行路由的批量操作（如权限控制、日志记录等）

## 新的解决方案

### 1. 路由管理器 (RouteManager)

位置：`src/utils/routeManager.ts`

**核心功能：**
- 自动注册路由和路由组
- 防止重复注册
- 支持中间件配置
- 提供路由信息查看和统计

```typescript
// 创建路由管理器
const routeManager = createRouteManager(openapi);

// 注册路由组
routeManager.registerRouteGroups(routeGroups);

// 注册独立路由
routeManager.registerRoutes(standaloneRoutes);
```

### 2. 集中式路由配置

位置：`src/routes/index.ts`

**优势：**
- 所有路由配置集中在一个文件中
- 支持路由分组管理
- 易于添加、修改和删除路由
- 支持路由元数据和统计信息

```typescript
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
  }
];
```

## 使用指南

### 添加新的端点

#### 方法1：添加到现有路由组

1. 在 `src/endpoints/` 下创建端点文件
2. 在对应的 `index.ts` 中导出端点
3. 在 `src/routes/index.ts` 中添加路由配置

```typescript
// 在 routeGroups 中添加新路由
{
  prefix: '/poole-ftp',
  routes: [
    // ... 现有路由
    {
      path: '/new-endpoint',
      method: 'post',
      handler: pooleFtpEndpoints.NewEndpoint
    }
  ]
}
```

#### 方法2：创建新的路由组

```typescript
// 添加新的路由组
export const routeGroups: RouteGroup[] = [
  // ... 现有路由组
  {
    prefix: '/user',
    routes: [
      {
        path: '/profile',
        method: 'get',
        handler: userEndpoints.GetProfile
      },
      {
        path: '/update',
        method: 'put',
        handler: userEndpoints.UpdateProfile
      }
    ],
    middleware: [authMiddleware] // 可选：组级中间件
  }
];
```

### 添加中间件

#### 路由级中间件

```typescript
{
  path: '/protected-endpoint',
  method: 'post',
  handler: SomeEndpoint,
  middleware: [authMiddleware, rateLimitMiddleware]
}
```

#### 路由组级中间件

```typescript
{
  prefix: '/admin',
  routes: [...],
  middleware: [adminAuthMiddleware] // 应用到组内所有路由
}
```

### 查看路由信息

在开发环境中，路由管理器会自动打印路由信息：

```
📋 Registered Routes:
==================================================

📂 poole-ftp:
  POST   /poole-ftp/get-files-list
  POST   /poole-ftp/get-files-download-url

==================================================

📊 Route Statistics: {
  totalGroups: 1,
  totalRoutes: 2,
  groupRoutes: 2,
  standaloneRoutes: 0
}
```

## 高级功能

### 自动路由注册

`routeManager.ts` 还提供了 `autoRegisterEndpoints` 函数，可以自动扫描端点目录并注册路由：

```typescript
// 自动注册端点（实验性功能）
await autoRegisterEndpoints(
  routeManager,
  '../endpoints/poole-ftp/index',
  {
    prefix: '/poole-ftp',
    middleware: [someMiddleware]
  }
);
```

### 路由元数据

可以为路由组添加元数据，用于文档生成和管理：

```typescript
export const routeMetadata = {
  '/poole-ftp': {
    description: 'Poole FTP 相关接口',
    version: '1.0.0',
    tags: ['Poole-FTP']
  }
};
```

## 最佳实践

### 1. 路由组织

- 按功能模块分组（如 `/user`, `/admin`, `/api/v1`）
- 使用有意义的前缀
- 保持路径简洁明了

### 2. 中间件使用

- 在路由组级别应用通用中间件（如认证、日志）
- 在路由级别应用特定中间件（如限流、验证）

### 3. 文件组织

```
src/
├── endpoints/          # 端点实现
│   ├── poole-ftp/
│   ├── user/
│   └── admin/
├── routes/            # 路由配置
│   └── index.ts
├── utils/             # 工具函数
│   └── routeManager.ts
└── middleware/        # 中间件
    ├── auth.ts
    └── rateLimit.ts
```

### 4. 命名约定

- 端点类名使用 PascalCase：`GetFilesList`
- 路由路径使用 kebab-case：`/get-files-list`
- 路由组前缀使用 kebab-case：`/poole-ftp`

## 迁移指南

### 从手动注册迁移到新方案

1. **保留现有端点文件**：无需修改端点实现

2. **创建路由配置**：在 `src/routes/index.ts` 中添加路由配置

3. **更新主入口文件**：替换手动注册代码

4. **测试验证**：确保所有路由正常工作

### 示例迁移

**迁移前：**
```typescript
// index.ts
openapi.post("/poole-ftp/get-files-list", pooleFtpEndpoints.GetFilesList);
openapi.post("/poole-ftp/get-files-download-url", pooleFtpEndpoints.GetFilesDownloadUrl);
```

**迁移后：**
```typescript
// routes/index.ts
export const routeGroups: RouteGroup[] = [
  {
    prefix: '/poole-ftp',
    routes: [
      { path: '/get-files-list', method: 'post', handler: pooleFtpEndpoints.GetFilesList },
      { path: '/get-files-download-url', method: 'post', handler: pooleFtpEndpoints.GetFilesDownloadUrl }
    ]
  }
];

// index.ts
const routeManager = createRouteManager(openapi);
routeManager.registerRouteGroups(routeGroups);
```

## 总结

新的端点管理方案提供了：

✅ **更好的组织结构**：路由配置集中管理
✅ **更强的可维护性**：易于添加、修改和删除路由
✅ **更好的可扩展性**：支持中间件和路由组
✅ **更好的开发体验**：自动打印路由信息和统计
✅ **更好的类型安全**：TypeScript 支持

这种方案特别适合中大型项目，能够有效解决端点数量增多时的管理问题。