# webgal-magic

高性能 `webgal-script` 解析器

> 项目使用 [Vite Plus](https://viteplus.dev/) 进行管理项目

## 基准测试

以下是运行50次和100次测试结果

```webgal

VITE+ - The Unified Toolchain for the Web

~/packages/magic-parser$ tsx ./scripts/benchmark-parse.ts ⊘ cache disabled
iterations=50
webgal-parser: total 661.98ms, avg 13.24ms
webgal-parser-config: total 1.47ms, avg 0.03ms
webgal-parser-new: total 335.06ms, avg 6.70ms
webgal-parser-config-new: total 1.35ms, avg 0.03ms


VITE+ - The Unified Toolchain for the Web

~/packages/magic-parser$ tsx ./scripts/benchmark-parse.ts 100 ⊘ cache disabled
iterations=100
webgal-parser: total 1100.52ms, avg 11.01ms
webgal-parser-config: total 1.82ms, avg 0.02ms
webgal-parser-new: total 525.05ms, avg 5.25ms
webgal-parser-config-new: total 1.33ms, avg 0.01ms

```

## 关于

作者：[徐然](https://github.com/xiaoxustudio)

联系方式：[xiaoxustudio@foxmail.com](mailto:xiaoxustudio@foxmail.com)

欢迎提出您宝贵的 **issue**，我们将会处理。

## LICENSE

项目遵循遵循 MIT 许可协议——详情请参阅 [许可协议](LICENSE)
