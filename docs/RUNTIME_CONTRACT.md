# Fast.Utils runtime contract / 运行时契约

## Runtime and package contract

- Runtime platforms: ES2022 modern browsers, WebViews, Vue 2.7/3 applications, and uni-app.
- Package format: pure ESM with one public named-export entry; CommonJS, UMD, and IIFE are not shipped.
- Framework boundary: Vue remains external to the package build and is an optional peer in `^2.7.0 || ^3.3.0`.
- uni-app boundary: `configureStorage({ prefix })` detects global `uni` at call time and uses its synchronous Storage API.
- Browser storage: applications call `configureStorage()` once, then import `Local` and `Session` directly from the package.
- Stateful browser defaults: Storage and Identity configuration are page-global by design. Conflicting reconfiguration throws.
- Security: secure random APIs require Web Crypto and never fall back to `Math.random()`.
- Publishing: the repository root is the only package, `dist/` is the only build output, and `package.json#exports` is the complete public path whitelist.

Importing a module does not itself read `window`, browser Storage, or `uni`, so unsupported platform capabilities fail only when the corresponding API is called.

## Public API policy

- Stateless Array, Date, String, Number, Object, Base64, Color, DOM, Env, Async, and Crypto capabilities use named exports.
- The public API uses named functions instead of mutable aggregate utility objects.
- Stateful browser capabilities use cohesive package-owned objects: `Local`, `Session`, `installationIdentity`, and logger instances. Logger scope is supplied to each severity method rather than stored in child instances.
- Internal adapters and client factories are implementation details and are not public export paths.
- Removing a named function, changing Storage/ciphertext formats, raising the browser syntax target, or changing the Vue peer range requires an explicit major-version Breaking Change.

## 运行时与包契约

- 运行平台：ES2022 现代浏览器、WebView、Vue 2.7/3 应用和 uni-app。
- 包格式：仅纯 ESM 和单一公开具名导出入口，不发布 CommonJS、UMD 或 IIFE。
- Vue 边界：Vue 不会打进本包产物，是 `^2.7.0 || ^3.3.0` 的可选 Peer。
- uni-app：`configureStorage({ prefix })` 在调用阶段自动检测全局 `uni` 并使用其同步 Storage API。
- Storage：程序入口配置一次，其他文件直接从包导入 `Local` 和 `Session`。
- 状态：Storage 与 Identity 配置按浏览器页面全局共享；冲突配置明确抛错。
- 安全随机：要求 Web Crypto，禁止回退 `Math.random()`。
- 发布：根目录是唯一 npm 包，`dist/` 是唯一构建输出，`exports` 是完整公共路径白名单。

模块导入本身不读取 `window`、浏览器 Storage 或 `uni`，不具备对应平台能力时只在调用相关 API 时明确失败。

无状态能力统一使用具名导出。有状态浏览器能力使用 `Local`、`Session`、`installationIdentity` 和 Logger 实例；Logger 作用域随每次级别方法调用传入，不创建 Child Logger。
