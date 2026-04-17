import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    dts: {
      tsgo: true,
    },
    outputOptions: {
      name: "webgal-magic",
    },
    exports: true,
    format: ["esm", "cjs", "umd"],
  },
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  fmt: {},
});
