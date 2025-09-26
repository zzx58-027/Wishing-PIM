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
- Cloudflare Durable Object
  - 你确定不是因为没有用到的代码被 vite 构建时去除了的原因吗? Cloudflare DO 官方文档中似乎没有提及需要显示导入导出 DO class. (不完全是这个原因, 因为查看 wrangler 自动生成的类型文件发现差异)
    - 解决方法: 在 main.ts 中具名导出, 你无法通过类型覆盖的方式解决, 需要 cf 能正确处理才行; 显示声明 Env 的类型(会丢失其他的 bindings, 暂时没想到 workaround);
    - 证据
      - COUNTER: DurableObjectNamespace<import("./src/main").Counter>;
      - POOLE_FTP_DO_CLIENT: DurableObjectNamespace /* PooleFTP_DO_Client */;
      - Before you create and access a Durable Object, its behavior must be defined by an ordinary exported JavaScript class.
      - https://developers.cloudflare.com/durable-objects/get-started/#2-write-a-durable-object-class-using-sql-api
    - 一个值得关注的原因: Vite/Rollup 看到 myDurableObject.ts 被导入，但其中的 MyDurableObject 类没有被 main.ts 中的任何逻辑直接实例化或调用，也没有从 main.ts 中再次导出。因此，打包器认为这个导出是**“死代码” (dead code)**，并将其从最终的 worker.js 文件中移除，因为它追求最小的输出文件。
    - 虽然官方文档没有直接说“请在您的 Vite 入口文件中重新导出”，但它间接要求最终的脚本文件必须包含一个顶层导出。
    - 根据证据 1, 2, 说明 main.ts 中导入导出的逻辑是正确的, 也可以自行测试.
    - 无用功纪念.
      ```ts
      type AppContext = HonoContext<{
        // Omit 的使用由于 TS 的交叉类型的同名属性冲突处理机制.
        Bindings: Omit<Env, "POOLE_FTP_DO_CLIENT"> & {
          POOLE_FTP_DO_CLIENT: DurableObjectNamespace<PooleFTP_DO_Client>;
        };
      }>;
      export const durableObjectExports = {};
      // {'./services/poole-ftp/cf-do.ts': [Object: null prototype] [Module] { PooleFTP_DO_Client: [Getter] }}
      const CF_DO_Modules = import.meta.glob("./services/**/*.cf-do.ts", {
        eager: true,
      });
      Object.entries(CF_DO_Modules).forEach(([path, module]) => {
        const key = path.split("/").at(-1).split(".").at(0);
        durableObjectExports[key] = module;
      });
      console.log(CF_DO_Modules);
      console.log(durableObjectExports);
      ```

