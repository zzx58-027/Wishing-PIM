import {
  defineConfig,
  // We don't need Attributify, we can use clsx & tailwind-merge
  // presetAttributify,
  presetWebFonts,
  transformerDirectives,
  transformerVariantGroup,
  presetIcons,
  presetWind4,
} from "unocss";

export default defineConfig({
  presets: [
    presetIcons({
      autoInstall: false,
      collections: {},
    }),
    presetWind4,
  ],
  transformers: [transformerDirectives(), transformerVariantGroup()],
});
