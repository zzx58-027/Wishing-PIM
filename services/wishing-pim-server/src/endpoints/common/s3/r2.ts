import { OpenAPIRoute, contentJson, StringParameterType, Str } from "chanfana";
import { randomUUID } from "crypto";
import { Context } from "hono";
import { stream } from "hono/streaming";
import { success } from "zod/v4";

type AppContext = Context<{ Bindings: Env }>;

export class UploadFile extends OpenAPIRoute {
  schema = {
    tags: ["S3"],
    summary: "Upload files to object storage",
    request: {
      // 在 chanfana 的 OpenAPIRoute 中， 不能在 request 对象中直接定义 headers 和 query 。这是框架本身的限制。
      // 对于 query 参数 ：在 chanfana 中，你需要在 handle 方法中直接从 c.req.query() 获取：
      // query: z.object({
      //   asJSONFile: z.boolean().default(false),
      // }),
      body: {
        content: {
          "multipart/form-data": {
            // schema: z.object({
            //   file: Str({ format: "binary" } as StringParameterType),
            // }),
            schema: z.object({
              files: z
                .array(Str({ format: "binary" } as StringParameterType))
                .nonempty(),
              // asJsonFile: z.boolean().default(false),
            }),
          },
        },
      },
    },
    responses: {
      200: {
        description: "Operations successed.",
        // ...contentJson(),
        content: {
          "application/json": {
            schema: z.array(
              z.object({
                success: z.boolean(),
                data:
                  z.array(
                    z.object({
                      fileName: z.string(),
                      url: z.string().url(),
                      key: z.string(),
                    })
                  ) ||
                  z.object({
                    success: z.boolean(),
                    message: z.string(),
                  }),
              })
            ),
          },
          "application/octet-stream": {
            schema: Str({ format: "binary" } as StringParameterType),
          },
          "application/pdf": {
            schema: Str({ format: "binary" } as StringParameterType),
          },
          "application/zip": {
            schema: Str({ format: "binary" } as StringParameterType),
          },
        },
        // headers: z.object({
        //   "Content-Type": z.string(),
        //   "Content-Length": z.string(),
        //   "Content-ETag": z.string(),
        //   "Content-Disposition": z.string(),
        // }),
      },
      405: {
        description: "Method Not Allowed",
        ...contentJson(
          z.object({
            success: z.boolean(),
            message: z.string(),
          })
        ),
      },
    },
  };

  private async returnAsJsonFile({
    c,
    method,
    optKey,
    data,
  }: {
    c: AppContext;
    method: string;
    optKey: string;
    data: object;
  }) {
    return stream(c, async (stream) => {
      c.status(200);
      c.header("Content-Type", "application/json");
      c.header(
        "Content-Disposition",
        `attachment; filename="${method}-results-${new Date()
          .toISOString()
          .replace(/:/g, "-")}_${optKey}.json"`
      );
      const json = JSON.stringify(data, null, 2);
      // 将 stream.pipe() 改为 stream.write() ，这是处理字符串数据的正确方法
      await stream.write(json);
    });
  }

  async handle(c: AppContext) {
    // const formData = await c.req.formData();
    // const files = formData.getAll("files") as File[];
    // key 主要供 Get 方法使用
    // const url = new URL(c.req.url);
    // c.req.path, // "/s3/r2"
    // const key = url.pathname.slice(1); // R2 中存储, key 嵌套层级没有顶部的 /, 即 ENDON/Specs, 而不是 /ENDON/Specs
    // const key = c.req.param("key");
    // multipart/form-data 的特殊性 ：文件上传使用的 multipart/form-data 格式与普通的 JSON 请求体不同，chanfana 的类型系统在这种情况下会返回 undefined
    // const userInput = (await this.getValidatedData<typeof this.schema>()).body;

    // 目标应用场景会用到文件名作为结果命名, 通过 optKey 避免文件存储 key 重复问题, 同时保留原文件名支持外部服务
    const optKey = randomUUID();
    const asJSONFile = c.req.query("asJSONFile");

    switch (c.req.method) {
      // https://hono.dev/examples/file-upload
      // https://hono.dev/docs/api/request#parsebody
      // https://chanfana.pages.dev/examples-and-recipes#file-uploads-if-supported-or-planned
      // hono 教程的 parseBody 有过时, 要根据方法签名
      case "PUT": {
        // parseBody 请查看方法签名, 需要设置为 all 才能保证输出为数组.
        // const body = await c.req.parseBody({ all: true });
        // const file = body["file"] as string | File;
        // 当输入一个文件时, 会报错 not itterable. 感觉有点难用, 使用 formData 传统方式
        // const files = body["files"] as (string | File)[];
        const formData = await c.req.formData();
        const files = formData.getAll("files") as File[];
        // formData.get() 方法返回的是 string | File | null 类型，不能直接使用 as boolean 进行类型断言
        // 在 FormData 中，布尔值通常以字符串形式传输（"true" 或 "false"），需要通过字符串比较来正确转换为布尔值
        // const asJsonFile = formData.get("asJsonFile") === "true";

        const results = [];

        for (const file of files) {
          if (typeof file === "string") {
            return new InputValidationException(
              `File as URL currently don't support, file is required: ${file}`
            );
          }

          await c.env.R2_Temp.put([optKey, file.name].join("/"), file, {
            httpMetadata: {
              contentType: file.type,
              contentDisposition: `attachment; filename="${file.name}"`,
              // Content-Length 是服务器自动计算的响应头，不是客户端设置的请求头; 上传对象时，R2 会自动从请求体中计算并存储对象大小，无需手动设置
              // contentLength: file.size,
            },
          });

          // 根据环境生成不同的URL
          // 通过检查CF_ACCOUNT_ID是否为占位符来判断是否为本地开发环境
          //   const isLocalDev =
          //     c.env.CF_ACCOUNT_ID === "${CF_ACCOUNT_ID}" || !c.env.CF_ACCOUNT_ID;
          //   const fileUrl = isLocalDev
          //     ? `http://localhost:8787/api/s3/r2/${optKey}/${file.name}` // 本地开发环境URL
          //     : `https://${c.env.CF_ACCOUNT_ID}.r2.cloudflarestorage.com/${c.env.R2_TEMP_BUCKET}/${optKey}/${file.name}`; // 生产环境URL
          const fileUrl = `https://${c.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com/${c.env.R2_TEMP_BUCKET}/${optKey}/${file.name}`;

          results.push({
            fileName: file.name,
            url: fileUrl,
            key: `${optKey}/${file.name}`,
          });
        }

        c.status(200);

        if (asJSONFile === "true") {
          return this.returnAsJsonFile({
            c,
            method: c.req.method,
            optKey,
            data: results,
          });
        }

        return {
          success: true,
          data: results,
        };
      }

      // 注意 POST 方法的 formdata 解析不要放到方法处理外, 其他方法没有用到会报错.
      case "GET": {
        const key = c.req.param("key");
        const object = await c.env.R2_Temp.get(key);
        if (object) {
          return stream(c, async (stream) => {
            c.status(200);
            c.header("Content-Type", object.httpMetadata.contentType);
            c.header(
              "Content-Disposition",
              object.httpMetadata.contentDisposition
            );
            c.header("ETag", object.httpEtag);
            await stream.pipe(object.body);
          });
        } else {
          // return c.json({ success: false, message: "Object not found" }, 404);
          throw new NotFoundException(`Object not found. Key: ${key}`);
        }
      }

      case "HEAD": {
        const key = c.req.param("key");
        const object = await c.env.R2_Temp.head(key);

        if (object) {
          c.status(200);

          // const headers = {
          //   "Content-Type": object.httpMetadata.contentType,
          //   "Content-Disposition": object.httpMetadata.contentDisposition,
          //   "ETag": object.httpEtag,
          //   "Content-Length": object.size.toString(),
          //   "Last-Modified": object.uploaded.toUTCString(),
          // };
          // Object.entries(headers).forEach(([k, v]) => c.header(k, v));

          if (asJSONFile === "true") {
            return this.returnAsJsonFile({
              c,
              method: c.req.method,
              optKey,
              data: object,
            });
          }
          return c.newResponse(null, 200, {
            "Content-Type": object.httpMetadata.contentType,
            "Content-Disposition": object.httpMetadata.contentDisposition,
            ETag: object.httpEtag,
            "Content-Length": object.size.toString(),
            "Last-Modified": object.uploaded.toUTCString(),
          });
        } else {
          throw new NotFoundException(`Object not found. Key: ${key}`);
        }
      }

      case "DELETE": {
        const key = c.req.param("key");
        await c.env.R2_Temp.delete(key);
        c.status(200);
        const result = {
          success: true,
          message: `Object deleted. Key: ${key}`,
        };
        if (asJSONFile === "true") {
          return this.returnAsJsonFile({
            c,
            method: c.req.method,
            optKey,
            data: result,
          });
        }
        return result;
      }

      default:
        return c.json(
          {
            success: false,
            message: "Method Not Allowed",
          },
          405,
          {
            Allow: "PUT, GET, DELETE",
          }
        );
    }
  }
}
