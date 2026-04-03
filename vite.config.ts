import { defineConfig } from "vite-plus";

export default defineConfig({
  staged: {
    "*": "vp check --fix",
    "*.test.ts": "vp test",
  },
  lint: { options: { typeAware: true, typeCheck: true } },
});
