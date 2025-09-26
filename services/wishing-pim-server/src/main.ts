// 具名导出所有 Durable Object 类, 使 CF 能正确识别.
export { PooleFTP_DO_Client };

const app = getAssembledHonoApp();
const openapi = getOpenAPI_Instance(app);

import { cors } from "hono/cors";
app.use("/*", cors({ origin: "*" }));
app.use("*", async (c, next) => {
  await next();
});

// 注册 inngest 及其服务路由
import { EventSchemas } from "inngest";
const inngestFuncsSchemas = new EventSchemas().fromZod({});
const inngestApp = getInngestHonoApp([], inngestFuncsSchemas);
app.route("/api/inngest", inngestApp);

// 注册 Poole-FTP 路由组
import { getPooleFTP_HonoApp, PooleFTP_DO_Client } from "./services/poole-ftp";
openapi.route("/poole-ftp3", getPooleFTP_HonoApp());

import * as s3Endpoints from "./endpoints/common/s3/index";
// 注册 S3 R2_Temp 路由组
openapi
  .put("/s3/r2_temp/upload", s3Endpoints.UploadFile)
  .delete("/s3/r2_temp/delete/:key", s3Endpoints.UploadFile)
  .get("/s3/r2_temp/get/:key", s3Endpoints.UploadFile)
  .on("head", "/s3/r2_temp/get-info/:key", s3Endpoints.UploadFile);
openapi.post("/s3/get-presigned-url", s3Endpoints.GetPresignUrl);

// 注册 Webhooks 路由组
import { ExtractProductSpecData } from "./endpoints/ai";
// openapi.post("/webhooks/minerU", MinerUWebhookCallbackHandler);
openapi.post("/ai/test", ExtractProductSpecData);

// 导出Durable Object类，使其对Cloudflare可用
import * as TestEndpoints from "./endpoints/test";
export { Counter } from "./cf-do-classes/task";
// 注册 Durable Object 测试端点
openapi.post("/test/counter", TestEndpoints.Counter);

export default app;
