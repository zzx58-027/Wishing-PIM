# Inngest Functions 管理指南

## 概述

本文档详细说明了 `inngest/funcs` 文件夹下功能方法的组织结构、命名规范和管理最佳实践。

## 当前项目结构分析

### 现有目录结构

```
inngest/funcs/
├── index.ts                    # 主导出文件
├── pdf/                        # PDF 处理相关功能
│   ├── index.ts               # PDF 模块导出
│   ├── convert-to-img.ts      # PDF 转图片
│   ├── extract-main-bbox.ts   # 提取主要边界框
│   ├── extract-order-items.ts # 提取订单项
│   └── parse-to-zipped-result.ts # 解析为压缩结果
└── webhookHandlers/           # Webhook 处理器
    ├── index.ts              # Webhook 模块导出
    └── minerU.ts             # MinerU webhook 处理
```

### 当前代码模式分析

每个功能文件都遵循以下模式：

```typescript
// 1. 事件名称常量
export const EVENT_NAME = "category/action" as const;

// 2. 事件数据类型定义
export interface EventData {
  // 数据字段
}

// 3. 事件类型定义
export interface Event {
  name: typeof EVENT_NAME;
  data: EventData;
}

// 4. Function 处理器
export const functionHandler = inngest.createFunction(
  { id: "function-id" },
  { event: EVENT_NAME },
  async ({ event, step }) => {
    // 处理逻辑
  }
);
```

## 子文件夹命名规范

### 1. 按业务领域分类（推荐）

```
inngest/funcs/
├── pdf/              # PDF 文档处理
├── image/            # 图像处理
├── email/            # 邮件服务
├── notification/     # 通知服务
├── data/             # 数据处理
├── auth/             # 认证相关
├── payment/          # 支付处理
├── webhookHandlers/  # Webhook 处理器
└── scheduled/        # 定时任务
```

### 2. 按功能类型分类

```
inngest/funcs/
├── processors/       # 数据处理器
├── handlers/         # 事件处理器
├── workflows/        # 工作流
├── integrations/     # 第三方集成
├── utilities/        # 工具函数
└── monitors/         # 监控相关
```

### 3. 按数据流分类

```
inngest/funcs/
├── ingestion/        # 数据摄入
├── transformation/   # 数据转换
├── validation/       # 数据验证
├── enrichment/       # 数据丰富
├── storage/          # 数据存储
└── delivery/         # 数据交付
```

## 命名规范详解

### 文件夹命名

- **使用小写字母**：`pdf`, `webhookHandlers`
- **使用驼峰命名**：对于复合词使用驼峰，如 `webhookHandlers`
- **语义明确**：文件夹名应清楚表达其包含的功能类型
- **避免缩写**：除非是广泛认知的缩写（如 `pdf`, `api`）

### 文件命名

- **使用 kebab-case**：`convert-to-img.ts`, `extract-main-bbox.ts`
- **动词-名词结构**：`extract-order-items`, `parse-to-zipped-result`
- **描述性命名**：文件名应清楚表达功能用途

### 事件命名

- **使用斜杠分隔**：`"pdf/convert.to_img"`, `"webhooks/minerU"`
- **类别/动作模式**：`category/action` 或 `category/resource.action`
- **使用下划线连接**：动作部分使用下划线，如 `to_img`

### Function ID 命名

- **使用 kebab-case**：`"pdf-convert-to-img"`, `"minerU-webhook-callback"`
- **包含模块前缀**：便于识别和调试
- **描述性命名**：ID 应清楚表达功能用途

## 推荐的组织结构

### 方案一：业务领域驱动（推荐）

```
inngest/funcs/
├── index.ts
├── document/                    # 文档处理
│   ├── index.ts
│   ├── pdf/
│   │   ├── convert-to-img.ts
│   │   ├── extract-text.ts
│   │   └── split-pages.ts
│   ├── word/
│   │   ├── convert-to-pdf.ts
│   │   └── extract-images.ts
│   └── excel/
│       ├── parse-data.ts
│       └── generate-report.ts
├── integration/                 # 第三方集成
│   ├── index.ts
│   ├── minerU/
│   │   ├── webhook-handler.ts
│   │   ├── batch-process.ts
│   │   └── status-check.ts
│   ├── s3/
│   │   ├── upload-file.ts
│   │   ├── download-file.ts
│   │   └── cleanup-temp.ts
│   └── email/
│       ├── send-notification.ts
│       └── send-report.ts
├── workflow/                    # 业务工作流
│   ├── index.ts
│   ├── order-processing/
│   │   ├── validate-order.ts
│   │   ├── process-payment.ts
│   │   └── fulfill-order.ts
│   └── user-onboarding/
│       ├── send-welcome.ts
│       ├── setup-profile.ts
│       └── assign-permissions.ts
└── system/                      # 系统级功能
    ├── index.ts
    ├── monitoring/
    │   ├── health-check.ts
    │   └── performance-metrics.ts
    ├── maintenance/
    │   ├── cleanup-logs.ts
    │   └── backup-data.ts
    └── scheduled/
        ├── daily-report.ts
        └── weekly-cleanup.ts
```

### 方案二：功能类型驱动

```
inngest/funcs/
├── index.ts
├── processors/                  # 数据处理器
│   ├── index.ts
│   ├── pdf-processor.ts
│   ├── image-processor.ts
│   └── text-processor.ts
├── handlers/                    # 事件处理器
│   ├── index.ts
│   ├── webhook-handlers/
│   │   ├── minerU.ts
│   │   ├── stripe.ts
│   │   └── github.ts
│   └── user-handlers/
│       ├── registration.ts
│       ├── login.ts
│       └── password-reset.ts
├── workflows/                   # 复杂工作流
│   ├── index.ts
│   ├── document-pipeline.ts
│   ├── order-fulfillment.ts
│   └── user-onboarding.ts
└── utilities/                   # 工具函数
    ├── index.ts
    ├── file-utils.ts
    ├── notification-utils.ts
    └── validation-utils.ts
```

## 文件组织最佳实践

### 1. 模块化导出

每个子文件夹都应有 `index.ts` 文件：

```typescript
// pdf/index.ts
export * from './convert-to-img';
export * from './extract-text';
export * from './split-pages';

// 可选：导出函数数组用于注册
export const pdfFunctions = [
  convertToImgFunction,
  extractTextFunction,
  splitPagesFunction,
];
```

### 2. 主入口文件管理

```typescript
// funcs/index.ts
import { pdfFunctions } from './pdf';
import { webhookFunctions } from './webhookHandlers';
import { workflowFunctions } from './workflow';

// 导出所有函数
export * from './pdf';
export * from './webhookHandlers';
export * from './workflow';

// 导出函数数组用于批量注册
export const allFunctions = [
  ...pdfFunctions,
  ...webhookFunctions,
  ...workflowFunctions,
];

// 按类别导出
export const functionsByCategory = {
  pdf: pdfFunctions,
  webhooks: webhookFunctions,
  workflows: workflowFunctions,
};
```

### 3. 类型定义管理

创建专门的类型文件：

```typescript
// types/events.ts
export interface PDFConvertEvent {
  name: 'pdf/convert.to_img';
  data: {
    fileId: string;
    filePath: string;
    outputFormat?: 'png' | 'jpg';
  };
}

export interface WebhookEvent {
  name: 'webhooks/minerU';
  data: {
    payload: any;
    headers: Record<string, string>;
  };
}

// 联合类型
export type AllEvents = PDFConvertEvent | WebhookEvent;
```

### 4. 配置管理

```typescript
// config/functions.ts
export const FUNCTION_CONFIG = {
  pdf: {
    retries: 3,
    timeout: '5m',
    concurrency: 10,
  },
  webhooks: {
    retries: 1,
    timeout: '30s',
    concurrency: 100,
  },
} as const;
```

## 扩展建议

### 1. 添加新功能模块

当添加新的功能领域时：

1. 创建新的子文件夹
2. 添加 `index.ts` 导出文件
3. 在主 `index.ts` 中导入和导出
4. 更新类型定义
5. 添加相应的配置

### 2. 重构现有结构

如果需要重构现有结构：

1. 创建新的目录结构
2. 逐步迁移功能文件
3. 更新导入路径
4. 测试所有功能
5. 删除旧的文件结构

### 3. 性能优化

- **懒加载**：使用动态导入减少启动时间
- **分组注册**：按需注册函数组
- **缓存机制**：缓存常用的函数引用

## 总结

### 核心原则

1. **语义清晰**：文件夹和文件名应清楚表达其用途
2. **结构一致**：遵循统一的命名和组织规范
3. **模块化**：每个模块都应该是独立和可重用的
4. **可扩展**：结构应该便于添加新功能
5. **可维护**：代码组织应该便于理解和维护

### 推荐做法

- **优先使用业务领域驱动的组织方式**
- **保持文件夹层级不超过 3 层**
- **使用一致的命名规范**
- **每个模块都有清晰的导出接口**
- **定期重构和优化结构**

通过遵循这些规范，可以确保 Inngest 函数的代码库保持清晰、可维护和可扩展。