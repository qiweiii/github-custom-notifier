import { defineConfig } from "wxt";
import react from "@vitejs/plugin-react";

// See https://wxt.dev/api/config.html
export default defineConfig({
  vite: () => ({
    plugins: [react()],
  }),
  entrypointsDir: "./src/entrypoints",
  manifestVersion: 3,
  manifest: {
    description: "Custom Github Notifier",
    homepage_url: "https://github.com/qiweiii/github-custom-notifier",
    icons: {
      "16": "icon/16.png",
      "32": "icon/32.png",
      "48": "icon/48.png",
      "64": "icon/64.png",
      "96": "icon/96.png",
      "128": "icon/128.png",
    },
    permissions: ["alarms", "storage"],
    optional_permissions: ["notifications"],
    browser_action: {
      default_icon: "icon/icon-toolbar.png",
    },
    web_accessible_resources: [
      {
        resources: ["bell.ogg"],
        matches: ["*://*/*"],
      },
    ],
  },
});
