import { contentJson } from "chanfana";
import { PooleFTP_Client, PooleFTP_FileZodObj } from "./logic";

type AppContext = HonoContext<{ Bindings: Env }>;

export class GetFilesList extends OpenAPIRoute {
  schema = {
    tags: ["Poole-FTP"],
    summary: "Get files list at specific path.",
    request: {
      body: contentJson(
        z.object({
          path: z.string().min(1),
        })
      ),
    },
    responses: {
      "200": {
        description: "Return files list result for a specific path.",
        content: {
          "application/json": {
            schema: PooleFTP_FileZodObj,
            example: {
              files: [
                {
                  type: "d",
                  name: "VITEL ENERGIA",
                  size: 4,
                  time: 1721043439,
                  perm: 509,
                  owner: 349071,
                  doc_type: "/",
                  doc_full_path: "/VITEL ENERGIA",
                },
              ],
            },
          },
        },
      },
      ...NotFoundException.schema(),
    },
  };

  async handle(c: AppContext) {
    const pooleFTP_Client = new PooleFTP_Client(c.env);

    const userInput = await this.getValidatedData<typeof this.schema>();
    const { path } = userInput.body;
    c.status(200);
    const files = await pooleFTP_Client.getFilesList(path);
    return {
      files,
    };
  }
}
