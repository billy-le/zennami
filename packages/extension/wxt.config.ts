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
    startUrls: [
      "http://localhost:5173",
      "about:debugging#/runtime/this-firefox",
    ],
  },
  manifest: {
    permissions: ["storage", "offscreen"],
    host_permissions: [
      "https://*.api.radio-browser.info/*",
      "https://zennami-server-staging.workers.dev/*",
    ],
  },
  hooks: {
    "build:manifestGenerated": (wxt, manifest) => {
      if (wxt.config.mode === "development") {
        manifest.host_permissions?.push("http://localhost:5173/*");
      }

      if (wxt.config.browser === "firefox") {
        manifest.permissions = manifest.permissions?.filter(
          (p) => p !== "offscreen",
        );
      }
    },
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
