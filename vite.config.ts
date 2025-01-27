import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

import b24ui from "@bitrix24/b24ui-nuxt/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    b24ui({
      b24ui: {}
    })
  ]
});
