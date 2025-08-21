#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// 配置数组 - 可以动态配置需要处理的路径
const EXPORT_CONFIGS = [
  {
    // inngest-fns 目录配置
    scanPath: path.join(__dirname, "../src/endpoints/inngest-fns"),
    outputPath: path.join(__dirname, "../src/endpoints/inngest-fns/index.ts"),
    description: "Inngest Functions Auto Export",
  },
  // 可以添加更多配置
  {
    scanPath: path.join(__dirname, "../src/endpoints/poole-ftp"),
    outputPath: path.join(__dirname, "../src/endpoints/poole-ftp/index.ts"),
    description: "Poole-FTP Functions Auto Export",
  },
];

/**
 * 自动生成 index.ts 文件的导出语句
 * @param {string} dirPath - 要扫描的目录路径
 * @param {string} outputPath - 输出的 index.ts 文件路径
 * @param {string} description - 模块描述
 */
function generateExports(dirPath, outputPath, description = "Module") {
  const exports = [];

  // 检查目录是否存在
  if (!fs.existsSync(dirPath)) {
    console.log(`⚠️  Directory not found: ${dirPath}`);
    return;
  }

  function scanDirectory(currentPath, relativePath = "") {
    const items = fs.readdirSync(currentPath, { withFileTypes: true });

    for (const item of items) {
      if (item.isDirectory()) {
        // 递归扫描子目录
        const subPath = path.join(currentPath, item.name);
        const newRelativePath = relativePath
          ? `${relativePath}/${item.name}`
          : item.name;
        scanDirectory(subPath, newRelativePath);
      } else if (
        item.isFile() &&
        item.name.endsWith(".ts") &&
        item.name !== "index.ts"
      ) {
        // 生成导出语句
        const fileName = item.name.replace(".ts", "");
        const exportPath = relativePath
          ? `./${relativePath}/${fileName}`
          : `./${fileName}`;
        exports.push(`export * from "${exportPath}";`);
      }
    }
  }

  scanDirectory(dirPath);

  // 生成文件内容
  const content = `// Auto-generated exports - DO NOT EDIT MANUALLY
// Module: ${description}
// Generated on: ${new Date().toISOString()}
// Run 'npm run generate-exports' to regenerate

${exports.join("\n")}
`;

  // 确保输出目录存在
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 写入文件
  fs.writeFileSync(outputPath, content, "utf8");
  console.log(
    `✅ Generated exports for ${exports.length} files in ${outputPath} (${description})`
  );
}

// 处理所有配置的函数
function processAllConfigs() {
  console.log("🚀 Starting export generation...");
  console.log(`📋 Processing ${EXPORT_CONFIGS.length} configuration(s):\n`);

  let totalFiles = 0;

  EXPORT_CONFIGS.forEach((config, index) => {
    console.log(
      `[${index + 1}/${EXPORT_CONFIGS.length}] Processing: ${
        config.description
      }`
    );
    console.log(`   📁 Scan Path: ${config.scanPath}`);
    console.log(`   📄 Output: ${config.outputPath}`);

    const beforeCount = totalFiles;
    generateExports(config.scanPath, config.outputPath, config.description);
    console.log(""); // 空行分隔
  });

  console.log("🎉 All exports generated successfully!");
}

// 添加新配置的辅助函数
function addConfig(scanPath, outputPath, description) {
  EXPORT_CONFIGS.push({
    scanPath: path.resolve(scanPath),
    outputPath: path.resolve(outputPath),
    description,
  });
}

// 使用示例
if (require.main === module) {
  processAllConfigs();
}

module.exports = {
  generateExports,
  processAllConfigs,
  addConfig,
  EXPORT_CONFIGS,
};
