# 环境变量设置
- Choose to use either .dev.vars or .env but not both. If you define a .dev.vars file, then values in .env files will not be included in the env object during local development.
  - https://developers.cloudflare.com/workers/vite-plugin/reference/cloudflare-environments/#secrets-in-local-development
- "env.production" environment configuration
  - "kv_namespaces" exists at the top level, but not on "env.production".
    This is not what you probably want, since "kv_namespaces" is not inherited by environments.
    Please add "kv_namespaces" to "env.production".