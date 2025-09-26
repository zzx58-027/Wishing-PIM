import { contentJson } from "chanfana";
import { PooleFTP_Client, PooleFTP_FileZodObj } from "./logic";

type AppContext = HonoContext<{ Bindings: Env }>;

export class GetAllFiles extends OpenAPIRoute {
  schema = {
    tags: ["Poole-FTP"],
    summary: "Get files list at specific path.",
    request: {},
    responses: {
      "200": {
        description: "Return all files.",
        content: {
          "application/json": {
            schema: z.array(PooleFTP_FileZodObj),
          },
        },
      },
      ...NotFoundException.schema(),
    },
  };

  async handle(c: AppContext) {
    const pooleFTP_Client = new PooleFTP_Client(c.env);

    c.status(200);
    // const filesList = await pooleFTP_Client.getFilesRecursively();
    // const filesList = await pooleFTP_Client.getFilesRecursivelyWithConcurrentQueue();
    const filesList = await pooleFTP_Client.getAllFiles();
    // 统计 filesList 的传输字节大小, 不用了, 浏览器 接口测试工具 等自带. 
    return {
      filesList,
    };
  }
}
