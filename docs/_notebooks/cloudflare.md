# 环境变量设置
- Choose to use either .dev.vars or .env but not both. If you define a .dev.vars file, then values in .env files will not be included in the env object during local development.
  - https://developers.cloudflare.com/workers/vite-plugin/reference/cloudflare-environments/#secrets-in-local-development
- "env.production" environment configuration
  - "kv_namespaces" exists at the top level, but not on "env.production".
    This is not what you probably want, since "kv_namespaces" is not inherited by environments.
    Please add "kv_namespaces" to "env.production".
- Minimizing buffering is especially important for processing or transforming response bodies larger than the Worker's memory limit. For these cases, streaming is the only implementation strategy.
- 为什么 cloudflare worker API 还有分块上传支持? 不是还有 stream 支持吗? 这不就解决了内存压力问题吗?
  - 断点续传与弹性
  - 在网络带宽充足的情况下，单线程的流式上传速度会受到限制。它只能以一条连接的速度进行传输。
    分块上传允许客户端同时发起多个并发请求，每个请求上传一个数据块。这能充分利用网络带宽，极大地缩短大型文件的总上传时间。对于一个 1 GB 的文件，同时上传 10 个 100 MB 的块，通常会比一次性上传整个文件快得多。
  - 数据完整性与校验
    - 在流式传输中，如果数据在传输过程中出现损坏，你可能直到整个流传输完毕后才能发现。
      分块上传允许对每个数据块进行单独的校验。通常，上传每个块后，服务器会返回该块的 ETag（实体标签），客户端可以根据这个标签来验证数据完整性。这提供了更细粒度的错误控制和更高的可靠性。
  - 分块上传解决了可靠性、速度和断点续传问题，它让大文件上传变得更健壮、更高效。
  - 流解决了内存问题，它让 Worker 能够处理大文件，而不会耗尽内存。