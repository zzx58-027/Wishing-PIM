# 自动导出脚本

## 功能说明

`generate-exports.js` 脚本可以根据配置数组自动扫描指定目录下的所有 TypeScript 文件，并自动生成对应的 `index.ts` 文件的导出语句。支持多个目录的批量处理。

## 配置说明

脚本通过 `EXPORT_CONFIGS` 数组进行配置，每个配置项包含：

```javascript
{
  scanPath: '要扫描的目录路径',
  outputPath: '输出的 index.ts 文件路径', 
  description: '模块描述'
}
```

### 默认配置

```javascript
const EXPORT_CONFIGS = [
  {
    scanPath: path.join(__dirname, '../src/endpoints/inngest-fns'),
    outputPath: path.join(__dirname, '../src/endpoints/inngest-fns/index.ts'),
    description: 'Inngest Functions'
  }
];
```

## 使用方法

### 1. 运行脚本

```bash
# 在 wishing-pim-server 目录下运行
npm run generate-exports
```

### 2. 自动生成

脚本会：
- 扫描 `src/endpoints/inngest-fns` 目录及其子目录
- 找到所有 `.ts` 文件（除了 `index.ts`）
- 自动生成 `export * from "./path/to/file"` 语句
- 更新 `index.ts` 文件

### 3. 使用导出的模块

生成后，你可以在其他文件中这样使用：

```typescript
// 导入所有导出的内容
import { RefreshUserToken } from '../inngest-fns';

// 或者导入特定的内容
import { RefreshUserToken } from '../inngest-fns';
```

## 添加新配置

### 方法一：直接修改配置数组

在 `generate-exports.js` 文件中的 `EXPORT_CONFIGS` 数组中添加新的配置项：

```javascript
const EXPORT_CONFIGS = [
  {
    scanPath: path.join(__dirname, '../src/endpoints/inngest-fns'),
    outputPath: path.join(__dirname, '../src/endpoints/inngest-fns/index.ts'),
    description: 'Inngest Functions'
  },
  {
    scanPath: path.join(__dirname, '../src/endpoints/api-routes'),
    outputPath: path.join(__dirname, '../src/endpoints/api-routes/index.ts'),
    description: 'API Routes'
  },
  {
    scanPath: path.join(__dirname, '../src/utils'),
    outputPath: path.join(__dirname, '../src/utils/index.ts'),
    description: 'Utility Functions'
  }
];
```

### 方法二：使用辅助函数

```javascript
const { addConfig } = require('./scripts/generate-exports');

// 添加新配置
addConfig(
  '../src/endpoints/new-module',
  '../src/endpoints/new-module/index.ts',
  'New Module'
);
```

## 工作流程

1. **添加新文件**：在配置的目录下创建新的 TypeScript 文件
2. **运行脚本**：执行 `npm run generate-exports`
3. **自动更新**：所有配置的 `index.ts` 文件会自动更新包含新的导出语句
4. **直接使用**：无需手动修改 `index.ts`，直接在其他文件中导入使用

## 注意事项

- ⚠️ **不要手动编辑** 自动生成的 `index.ts` 文件，因为它们会被脚本覆盖
- 📁 脚本会递归扫描配置目录下的所有子目录
- 🔄 每次添加新文件后都需要运行一次脚本
- 📝 生成的文件包含模块描述和时间戳，方便追踪更新时间
- 🛡️ 脚本会自动检查目录是否存在，避免错误
- 📂 输出目录不存在时会自动创建
- 🔢 支持同时处理多个配置，一次性生成所有模块的导出文件

## 自动化建议

你可以考虑将此脚本集成到你的开发工作流中：

1. **Git hooks**：在提交前自动运行
2. **Watch 模式**：监听文件变化自动运行
3. **CI/CD**：在构建过程中自动运行

## 扩展功能

如果需要扩展到其他目录，可以修改 `generate-exports.js` 文件中的路径配置。