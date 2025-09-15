//   private getTargetBucket(c: AppContext, bucketName: string) {
//     // 创建存储桶映射
//     const bucketMap: Record<string, any> = {
//       "wishing-pim": c.env.R2_Main,
//       temp: c.env.R2_Temp,
//       "label-studio": c.env.Label_Studio,
//     };
//     // 获取目标存储桶
//     const targetBucket = bucketMap[bucketName];
//     if (!targetBucket) {
//       throw new InputValidationException(`Invalid bucket name: ${bucketName}`);
//     }
//     return targetBucket as R2Bucket;
//   }

//   private getS3Client(honoCtx: AppContext) {
//     let s3Client: S3Client | null;
//     if (!s3Client) {
//       s3Client = new S3Client({
//         region: "auto",
//         endpoint: honoCtx.env.R2_ENDPOINT,
//         credentials: {
//           accessKeyId: honoCtx.env.R2_SECRET_KEY_ID,
//           secretAccessKey: honoCtx.env.R2_SECRET_KEY,
//         },
//       });
//     }
//     return s3Client;
//   }

//   // PostCommand——Key 相同就覆盖，R2 不会报 409，返回仍是 200/204。
//   // 要做“防覆盖”只能在 签名之前自己保证： 先 Head 一下
//   // Key = userId + '/' + uuid + '.' + ext —— 理论冲突概率≈0，就不用检查。
//   private async getUploadFilePresignedUrl(
//     c: AppContext,
//     bucketName: string,
//     fileMeta: {
//       fileKey: string;
//       contentType: string;
//     }
//   ) {
//     const s3Client = this.getS3Client(c);
//     const raw_url = `${c.env.R2_ENDPOINT}/${bucketName}/${
//       fileMeta.fileKey
//     }?X-Amz-Expires=${3600}`;
//     console.log(raw_url);
//     const presignedUrl = await getSignedUrl(
//       s3Client,
//       new PutObjectCommand({
//         Bucket: bucketName,
//         Key: fileMeta.fileKey,
//         ContentType: fileMeta.contentType,
//       }),
//       {
//         expiresIn: 3600,
//       }
//     );
//     return {
//       fileKey: fileMeta.fileKey,
//       url: presignedUrl,
//     };
//   }

    // const _ = this.getTargetBucket(c, bucketName);
    // const presignedUrls = files.map((file) =>
    //   this.getUploadFilePresignedUrl(c, bucketName, {
    //     fileKey: file.fileKey,
    //     contentType: file.contentType,
    //   })
    // );
    // return c.json({
    //   success: true,
    //     data: await Promise.all(presignedUrls),
    // });