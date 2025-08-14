# 前端项目初始化相关

## 项目运行时
请使用 bun 作为我的项目运行时, 除非我有特别说明.

## 项目相关信息
> 本小节为项目初始化时所需使用的我的 author 信息, 请在项目中使用:
```json
{
  "name": "zzx58",
  "email": "8742236@gmail.com",
  "url": "https://github.com/zzx58_027"
}
```

## 最小前端项目依赖
> 当我声明我需要一个 Vue3 最小项目时, 我会用到以下依赖.
```bash
# 项目初始化
bun create vite {{project_name}} --template vue-ts
# 安装项目开发依赖
bun add -D unplugin-vue-router
bun add -D vite-plugin-vue-layouts
bun add -D unocss
bun add -D unplugin-vue-components
bun add -D unplugin-icons
# 安装项目运行依赖
bun add vue-router
bun add class-variance-authority
bun add tailwind-merge
bun add @unhead/vue
bun add unplugin-auto-import

```

## 常规前端项目依赖
> 当我声明我需要一个 Vue3 常规项目时, 我会用到以下依赖.
```bash
# 项目初始化
bun create vite {{project_name}} --template vue-ts
# 安装项目开发依赖
bun add -D vite-plugin-vue-devtools
bun add -D unplugin-vue-router
bun add -D vite-plugin-vue-layouts
bun add -D vite-plugin-inspect
bun add -D vite-bundle-analyzer 
bun add -D unocss
bun add -D naive-ui
bun add -D unplugin-vue-components
bun add -D unplugin-icons
bun add -D unplugin-turbo-console
bun add -D unplugin-fonts
bun add -D @pinia/colada-devtools
# 安装项目运行依赖
bun add vue-router
bun add consola
bun add unplugin-auto-import
bun add class-variance-authority
bun add tailwind-merge
bun add @vueuse/core
bun add @vueuse/components
bun add radash
bun add unplugin-vue-markdown
bun add markdown-it-link-attributes
bun add @unhead/vue
bun add date-fns
bun add pinia
bun add @pinia/colada
bun add fuse.js
bun add defu
```