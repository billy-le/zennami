import { defineConfig } from "wxt";
import tailwindcss from "@tailwindcss/vite";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  srcDir: "src",
  manifestVersion: 3,
  webExt: {
    binaries: {
      firefox: "firefoxdeveloperedition",
    },
  },
  vite: () => ({
    plugins: [tailwindcss()],
  }),
});
