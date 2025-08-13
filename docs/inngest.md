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
