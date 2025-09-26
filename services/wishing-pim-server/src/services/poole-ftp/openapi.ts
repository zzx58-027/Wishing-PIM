import {
  GetUserToken,
  DownloadFiles,
  GetFilesList,
  GetAllFiles,
  FindRelatedFiles,
} from ".";

// 注册 Poole-FTP 路由组
export const getPooleFTP_HonoApp = () => {
  const pooleFTP_HonoApp = new Hono<{ Bindings: Env }>();
  const openapi = fromHono(pooleFTP_HonoApp);
  // 合并于 /download-files 接口
  // .post("/get-files-download-url", GetFilesDownloadUrl)
  openapi
    .post("/test", FindRelatedFiles)
    .get("/get-user-token", GetUserToken)
    .post("/get-files-list", GetFilesList)
    .get("/getAllFiles", GetAllFiles)
    .post("/download-files", DownloadFiles);
  return openapi;
};
