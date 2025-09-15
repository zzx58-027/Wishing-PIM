import { SelfAWS4Fetch } from "@/api/methods/s3";
import { OpenAPIRoute, contentJson } from "chanfana";
import { Context } from "hono";

type AppContext = Context<{ Bindings: Env }>;

export class GetPresignUrl extends OpenAPIRoute {
  schema = {
    tags: ["S3"],
    summary: "",
    request: {
      body: contentJson(
        // 虽然我们在schema中定义了这些属性是必填的，但TypeScript的类型系统无法跟踪这种运行时的验证。
        z
          .object({
            bucketName: z.string().min(1, "存储桶名称不能为空"),
            files: z
              .array(
                z
                  .object({
                    // 用于标识文件
                    // fileKey 为 uuid, 避免存储的冲突, 但是 uuid 的提供可选由浏览器, 以支持特定逻辑. 也是业界实践.
                    fileKey: z.string().min(1, "文件标识不能为空"),
                    fileFullPath: z.string().min(1, "文件名不可为空"),
                    // contentType: z.string().min(1, "内容类型不能为空"),
                  })
                  .required()
              )
              .min(1, "至少需要上传一个文件"),
          })
          .strict()
      ),
    },
    response: {
      200: {
        description: "Operations successed.",
        ...contentJson(
          z.object({
            success: z.boolean(),
            data: z.array(
              z.object({
                upload_url: z.string().url(),
                fileKey: z.string(),
              })
            ),
          })
        ),
      },
    },
  };

  async handle(c: AppContext) {
    const userInput = (await this.getValidatedData<typeof this.schema>()).body;
    const { bucketName, files } = userInput;

    const aws4Fetch = new SelfAWS4Fetch(c);
    // const result = parser.parse(await aws4Fetch.ListBuckets());
    const presignedUrls = await Promise.all(
      files.map(async (file) => {
        const uploadUrl = await aws4Fetch.getPresignedUrl(
          bucketName,
          file.fileKey
        );
        return {
          uploadUrl,
          fileFullPath: file.fileFullPath,
          fileKey: file.fileKey,
        };
      })
    );
    c.status(200);
    return c.json({
      success: true,
      data: presignedUrls,
    });
  }
}
