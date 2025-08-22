// Alova.js 统一管理服务请求
// 注意：此文件已被重构，现在使用基于上下文的 API 方法
// 请使用 ./methods/poole-ftp.ts 中的 createPooleFTPAlova 函数

// 重新导出主要的工具函数和常量
export {
  setPooleFTPSeriviceContext,
  getUserToken,
  getFilesList,
  getFilesDownloadUrl,
} from "./methods/poole-ftp";


