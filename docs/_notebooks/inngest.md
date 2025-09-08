# QA
- Inngest 路由注册后无法部署.
   - 问题原因： Cloudflare Workers 部署失败的根本原因是 Inngest 客户端在模块级别初始化时尝试访问环境变量，但在 Cloudflare Workers 环境中，环境变量只在运行时（请求处理期间）可用，而不是在模块加载时可用。这导致了 Invalid URL string 错误。
- INNGEST_BASE_URL 如果是指向 self-hosted 需要作为 secret, 因为没有额外的鉴权. 如果是 官方 URL, 即使暴露，攻击者无法仅凭该地址访问你的数据或触发操作（仍需认证方式如 signing_key）。

# Inngest 连接
## 一些情况
- 本地开发情况下, wrangler.jsonc 无需声明 vars 中变量, .env 中变量会在 typegen 时被声明和读取.
## Inngest Server
- inngest start (server docker 部署) (本地 app)
   - 下述情况为 .env 中 INNGEST_DEV=1
     - 当使用 inngest start 时, docker compose yaml command 不需要提供 -u 参数描述, 可以正确连接, 通过局域网 IP.
     - 问题: server 无法通过 host.docker.internal 访问到 app, 会提示 Error: forbidden. 暂时不清楚原因. 根据后面的添加描述, -u 声明 host.docker.internal 即可.
     - 需要提供 INNGEST_EVENT_KEY & INNGEST_SIGNING_KEY 环境变量, 这可以在容器日志中看到相关报错.
     - 根据文档, 环境变量 INNGEST_SIGNING_KEY 会自动被添加, 不需要在 sdk 中显示声明, 好像文档也推荐不声明.
     - 不显示 sdk 中声明 baseUrl 会如何? 仍然可以 sync, 主要是关于 url 形式: http://192.168.1.46:5173/api/inngest 是可以的.
     - 在这种情况下，首选使用 INNGEST_DEV=1。对于 Docker，可能还适合设置 INNGEST_BASE_URL=http://host.docker.internal:8288 .在我们的 Docker 指南中了解更多信息。
       - https://www.inngest.com/docs/sdk/environment-variables#inngest-base-url
   - 当 .env 中 INNGEST_DEV=0 时
     - 报错 Error: unauthorized. Little Snitch 提示 inngest.com 的访问请求. 本地 console 显示 /api/inngest 401.
     - 使用 云 inngest EVENT_KEY 和 SIGNING_KEY 时, 本地 console 400.
     - !!! 当 cloud 模式, 即 INNGEST_DEV=0 时, 指明 INNGEST_BASE_URL 为本地 inngest 地址, 成功! 无需 sdk 显示声明, .env 中有即可. NG 响应时 cloud 模式 server 会有轮询现象, 200 后停止.
     - 本地的 server 使用 局域网IP sync 时, 会有一定时间的 error, 可能因为 tunnel 地址原因无法访问本地, 后续通过 本地 server local 获取到的地址, 可以正常 sync. 但云 url 作为 baseUrl 是有需要的, 因为 云 app 会用到. 不能注释吊 env 的 baseUrl, 会访问云端. 另外重复, 无需 sdk 中显示声明这些环境变量. 接下来是 云app 的环境变量设置测试.
- inngest start (server docker 部署) (云端 app)
  - 因为没有在 sdk 中显示声明变量, 因此不会遇到之前的部署报错问题. 但是因为所有 inngest 环境变量为空, 因此 /api/inngest 为 dev 模式, 没有任何 key 传递, 需要 secret put.
  - 有点奇怪, 控制台部署的 PooleSecret 可以被成功读取到, 但是 INNGEST 相关变量均未被读取.
  - 我的服务 wishing-pim-server 在本地开发时没有环境变量问题, .env 文件就ok 了, 但是当我部署到 cloudflare worker, 我在 cf 控制台设置的 POOLE_FTP_LOGIN_BASIC_AUTH 可以被正常读取到, . 但是 我设置的 INNGEST_DEV, INNGEST_BASE_URL, INNGEST_EVENT_KEY 均未被读取到, 按照 inngest 文档, 这些是可以被sdk自动读取到的. 我应该怎么做?
  - 尝试了 wrangler.jsonc 中设置 vars, 通过 `"INNGEST_DEV": "${INNGEST_DEV}"` 成功解决了 mode 为 dev 问题, 但是增加 相关 KEY 会出现之前的部署报错问题,  看来是 inngest 尝试读取这些变量时, 变量未被设置, 导致报错.
    ```bash
      Uncaught TypeError: Invalid URL string.
      at null.<anonymous> (main.js:30539:29) in setEventKey
      at null.<anonymous> (main.js:30460:14) in loadModeEnvVars
      at null.<anonymous> (main.js:30432:14) in Inngest2
      at null.<anonymous> (main.js:30921:17)
    [code: 10021]
    ```
  - 以下是基本确认的观点: 
    1. Inngest SDK 内部如果没有 Worker 适配层，还是会尝试用 process.env，所以拿不到环境变量。
    2. Inngest SDK 尝试在模块加载时访问环境变量, 这时会取不到环境变量, 因为在 Cloudflare Workers 环境中，环境变量只在运行时可用，而不是在模块加载时。
    3. 错误 Invalid URL string 发生在 Inngest 客户端初始化时.
  - 根据实测, 重新部署后需要重新声明所有变量才可生效, 即使控制台可以看到有变量存在. wrangler 中 env 等变量可以不要.
  - 实测, 不需要单例等操作, inngest 能正常从 cloudflare worker 环境获取到环境变量, 之前的问题是由于前一点的变量重新部署失效导致的. put secret 即可.
- inngest dev (server docker 部署) (本地 app)
  - 不提供参数 -u 'sdk_url' 的情况能否连接?
  - 通过 -u 'xx host.docker.internal xx' 能否连接?
  - 可以不用提供 INNGEST_EVENT_KEY & INNGEST_SIGNING_KEY.
  - 如果提供了 INNGEST_EVENT_KEY & INNGEST_SIGNING_KEY 会如何, 会要求 sdk 也提供相关内容吗?
- inngest dev (server docker 部署) (云端 app)

## Inngest TS SDK









# other
在生产环境中，你的应用程序需要一个“事件密钥”才能将事件发送到Inngest。这是一个密钥，用于对你的应用程序进行身份验证，并确保只有你的应用程序才能将事件发送到Inngest账户中的给定环境。

一个关键的点: 文件水平管理, 在逻辑层进行结构的组织, 文件进行抽象, 其实是统一水平管理的. 

发现了一个问题。在 catch 块中再次调用 res.json() 会导致错误，因为 response 流已经被第一次 res.json() 调用消费了。

注意 step.fetch 后的代码的 step.run 包裹, fetch 后续代码会在 fetch 完成后被调起执行, 如果没有包裹起来, 可能会出错.

使用了 Bun 的 --cwd 参数来指定工作目录，这样可以避免使用 cd 命令：

# 流程
原始文件的组织形式: 根文件夹下有不同 brands 的 Specs 文件夹 -> root/JLP/Specs; root/ENDON/Specs; etc...
文件上传流程: 前端页面 -> 上传到 S3 -> 
MinerU 批量解析流程: spec 的 url -> 
Spec 批量推理提取流程: 

## Poole-FTP 流程
登录
