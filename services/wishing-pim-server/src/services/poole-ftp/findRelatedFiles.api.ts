import { contentJson } from "chanfana";

type AppContext = HonoContext<{ Bindings: Env }>;

export class FindRelatedFiles extends OpenAPIRoute {
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
        ...contentJson({})
      },
      ...NotFoundException.schema(),
    },
  };

  async handle(c: AppContext) {
    // const pooleFTP_DO_Client_stub =
    //   c.env.POOLE_FTP_DO_CLIENT.getByName("pooleFTP_DO_Client");
    // const test = await pooleFTP_DO_Client_stub.test();

    const userInput = await this.getValidatedData<typeof this.schema>();
    const {} = userInput.body;
    c.status(200);

    return {
      // data: test
      data: "123"
    };
  }
}
