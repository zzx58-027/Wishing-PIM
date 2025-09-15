import { Context } from "hono";
import { AwsClient } from "aws4fetch";

export class SelfAWS4Fetch {
  c: Context<{ Bindings: Env }>;
  s3Client: AwsClient | null;
  r2Endpoint: string;
  constructor(c: Context<{ Bindings: Env }>) {
    const { R2_ENDPOINT, R2_SECRET_KEY, R2_SECRET_KEY_ID } = c.env;
    this.r2Endpoint = R2_ENDPOINT;
    this.s3Client = new AwsClient({
      accessKeyId: R2_SECRET_KEY_ID,
      secretAccessKey: R2_SECRET_KEY,
      region: "auto",
    });
  }

  listBuckets = async () => {
    const resp = await this.s3Client.fetch(`${this.r2Endpoint}`);
    // S3 API 返回的是 XML 格式，不能直接使用 json() 方法解析
    const text = await resp.text();
    const result = parseXML(text);
    // 返回文本格式，由调用方决定如何处理
    return result;
  };

  getPresignedUrl = async (bucketName: string, objectKey: string) => {
    const url = withQuery(joinURL(this.r2Endpoint, bucketName, objectKey), {
      'X-Amz-Expires': 3600,
    });
    const resp = await this.s3Client.sign(url, {
      aws: { signQuery: true },
    });
    return resp.url
  };
}
