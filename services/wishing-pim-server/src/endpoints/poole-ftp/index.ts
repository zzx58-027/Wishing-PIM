// 方法1: 传统的显式导入导出（当前方式）
// import { GetFilesList } from "./getFilesList";
// import { GetFilesDownloadUrl } from "./getFilesDownloadUrl";
// export { GetFilesList, GetFilesDownloadUrl };

// 方法2: 使用 export * 重新导出所有内容（推荐）
export * from "./getFilesList";
export * from "./getFilesDownloadUrl";
export * from "./downloadFiles";
export * from './getUserToken'

// 方法3: 如果需要命名空间导出，可以这样做：
// export * as GetFilesList from "./getFilesList";
// export * as GetFilesDownloadUrl from "./getFilesDownloadUrl";

// 方法4: 如果文件很多，可以使用动态导入（适用于大型项目）
// const modules = import.meta.glob('./*.ts', { eager: true });
// for (const path in modules) {
//   if (path !== './index.ts') {
//     Object.assign(exports, modules[path]);
//   }
// }
