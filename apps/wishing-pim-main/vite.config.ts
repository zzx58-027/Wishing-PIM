import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import VueRouter from "unplugin-vue-router/vite";
import VueComponents from "unplugin-vue-components/vite";
import AutoImport from "unplugin-auto-import/vite";
import { NaiveUiResolver } from "unplugin-vue-components/resolvers";
import VueMarkdown from "unplugin-vue-markdown/vite";
import UnoCSS from 'unocss/vite'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vueDevTools({
      componentInspector: true,
      launchEditor: 'trae'
    }),
    // https://www.vue-plugins.org/plugins/unplugin-vue-router
    VueRouter({
      routesFolder: "src/pages",
      extensions: [".vue", ".md"],
    }),
    // VueMarkdown must be placed before Vue plugin
    VueMarkdown({
      headEnabled: true,
      markdownItOptions: {
        html: true, // 支持解析 Markdown 中的 HTML 标签.
        linkify: true, // 支持自动将纯文本链接转为可点击的 <a> 标签
        typographer: true, // 智能排版（引号、破折号优化）
      },
    }),
    // ⚠️ Vue must be placed after VueRouter() and VueMarkdown()
    vue({
      include: [/\.vue$/, /\.md$/],
    }),
    UnoCSS(),
    VueComponents({
      resolvers: [NaiveUiResolver()],
      dts: true,
    }),
    AutoImport({
      imports: ["vue", "vue-router", "@vueuse/core"],
      resolvers: [NaiveUiResolver()],
      dts: true,
    }),
  ],
});
