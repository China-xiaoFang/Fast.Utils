# Fast.Utils runtime contract / 运行时契约

## Runtime and package contract

- Runtime platforms: ES2022 modern browsers, WebViews, Vue 3 applications, and uni-app.
- Package format: one public named-export ESM entry for package managers and one separately minified IIFE entry for CDN use; CommonJS and UMD are not shipped.
- Framework boundary: Vue remains external to the package-manager build and is a required peer in `^3.3.0`.
- uni-app boundary: the first Storage operation, or an earlier `configureStorage({ prefix })` call, detects global `uni` and uses its synchronous Storage API.
- Browser storage: applications import `Local` and `Session` directly; `configureStorage()` is needed only to override defaults before the first operation.
- Stateful browser defaults: Storage and Identity configuration are page-global by design. Conflicting reconfiguration throws.
- Randomness: every random generation entry prefers Web Crypto and falls back to `Math.random()` when unavailable.
- Publishing: the repository root is the only package, `dist/` is the only build output, and `package.json#exports` is the complete public path whitelist.

Importing a module does not itself read `window`, browser Storage, or `uni`, so unsupported platform capabilities fail only when the corresponding API is called.

## Public API policy

- Stateless Array, Date, String, Number, Object, Base64, Color, DOM, Env, Async, and Crypto capabilities use named exports.
- The public API uses named functions instead of mutable aggregate utility objects.
- Stateful browser capabilities use cohesive package-owned objects: `Local`, `Session`, `installationIdentity`, and logger instances. Logger scope is supplied to each severity method rather than stored in child instances.
- Internal adapters and client factories are implementation details and are not public export paths.
- Removing a named function, changing Storage/ciphertext formats, raising the browser syntax target, or changing the Vue peer range requires an explicit major-version Breaking Change.

## 运行时与包契约

- 运行平台：ES2022 现代浏览器、WebView、Vue 3 应用和 uni-app。
- 包格式：包管理器使用单一公开具名导出 ESM 入口，CDN 使用单独压缩的 IIFE；不发布 CommonJS 或 UMD。
- Vue 边界：Vue 不会打进包管理器使用的构建产物，是 `^3.3.0` 的必需 Peer。
- uni-app：首次 Storage 操作或更早的 `configureStorage({ prefix })` 调用会检测全局 `uni`，并使用其同步 Storage API。
- Storage：直接从包导入 `Local` 和 `Session` 即可；只有覆盖默认值时才需在首次操作前调用 `configureStorage()`。
- 状态：Storage 与 Identity 配置按浏览器页面全局共享；冲突配置明确抛错。
- 随机数：所有随机生成入口都优先使用 Web Crypto，缺失时回退到 `Math.random()`。
- 发布：根目录是唯一 npm 包，`dist/` 是唯一构建输出，`exports` 是完整公共路径白名单。

模块导入本身不读取 `window`、浏览器 Storage 或 `uni`，不具备对应平台能力时只在调用相关 API 时明确失败。

无状态能力统一使用具名导出。有状态浏览器能力使用 `Local`、`Session`、`installationIdentity` 和 Logger 实例；Logger 作用域随每次级别方法调用传入，不创建 Child Logger。
