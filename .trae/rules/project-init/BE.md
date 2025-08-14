# 后端项目初始化相关

## 项目相关信息
> 本小节为项目初始化时所需使用的我的 author 信息, 请在项目中使用:
```json
{
  "name": "zzx58",
  "email": "8742236@gmail.com",
  "url": "https://github.com/zzx58_027"
}
```

## 项目依赖
> 请在项目中使用以下依赖:
```bash
# 项目初始化 
bun create cloudflare@latest {{project_name}}
# 项目开发依赖
bun add -D @types/node
bun add -D @types/service-worker-mock
bun add -D wrangler
# 项目运行时依赖
bun add chanfana
bun add hono
bun add zod
```