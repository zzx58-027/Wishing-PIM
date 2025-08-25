import { OpenAPIRoute, contentJson, StringParameterType, Str } from "chanfana";
import { Context } from "hono";

type AppContext = Context<{ Bindings: Env }>;

export class UploadFiles extends OpenAPIRoute {
  schema = {
    tags: ["S3"],
    summary: "Upload files to object storage",
    request: {
      body: {
        content: {
          "multipart/form-data": {
            schema: z.object({
              files: z.array(Str({ format: "binary" } as StringParameterType)),
            }),
          },
        },
      },
    },
    responses: {
      200: {
        description: "Files uploaded successfully",
        ...contentJson(
          z.array(z.object({

          }))
        ),
      },
    },
  };



  async handle(c: AppContext) {
    const formData = await c.req.formData();
    const files = formData.getAll("files") as File[];

    const uploadResults = []

    for (const file of files) {
        if (file instanceof File) {
            uploadResults.push({
                fileName: file.name,
                size: file.size,
                type: file.type,
            })
        }
    }
    return uploadResults
  }
}
