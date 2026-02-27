import { defineConfig } from "wxt";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  srcDir: "src",
  manifestVersion: 3,
  webExt: {
    binaries: {
      firefox: "firefoxdeveloperedition",
    },
    startUrls: ["http://localhost:5173"],
  },
  vite: () => ({
    plugins: [tailwindcss() as any],
    resolve: {
      alias: {
        "@zennami/shared": resolve(__dirname, "../shared/src"),
      },
    },
  }),
});
