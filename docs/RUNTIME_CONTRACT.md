# Fast.Utils runtime contract / 运行时契约

## Runtime and package contract

- Runtime platforms: ES2022 modern browsers, WebViews, Vue 3 applications, and uni-app.
- Package format: one public named-export ESM entry for package managers and one separately minified IIFE entry for CDN use; CommonJS and UMD are not shipped.
- Framework boundary: Vue remains external to the package-manager build and is a required peer in `^3.3.0`.
- uni-app boundary: the first Storage operation, or an earlier `configureStorage({ prefix })` call, detects global `uni` and uses its synchronous Storage API.
- Browser storage: applications import `Local` and `Session` directly; `configureStorage()` is needed only to override defaults before the first operation.
- Storage operation overrides: `set/get({ crypto })` select JSON or Base64 for one operation without mutating global configuration. The v3 envelope does not identify its codec, so callers must use matching options for the same entry.
- Storage read typing: `get<Value = string>()` defaults to `string | undefined` when no generic is supplied; codecs still restore the original runtime JSON value.
- Stateful browser defaults: Storage, Identity, and default Logger configuration are page-global by design. Storage and Identity reject conflicting reconfiguration; `configureLogger` replaces the default Logger configuration while preserving the exported facade reference.
- Randomness: every random generation entry prefers Web Crypto and falls back to `Math.random()` when unavailable.
- Publishing: the repository root is the only package, `dist/` is the only build output, and `package.json#exports` is the complete public path whitelist.

Importing a module does not itself read `window`, browser Storage, or `uni`, so unsupported platform capabilities fail only when the corresponding API is called.

## Public API policy

- Stateless Array, Date, String, Number, Object, Base64, Color, DOM, Env, Async, and Crypto capabilities use named exports.
- The public API uses named functions instead of mutable aggregate utility objects.
- Base64 and Crypto text decoders return primitive strings typed as `DecodedText`. They can be used directly as strings; JSON parsing occurs only through an explicit `.parseJson<T = any>()` call. The first text decode lazily installs a non-enumerable `String.prototype.parseJson` and rejects a foreign same-name property instead of overwriting it. Storage codecs continue to parse JSON automatically.
- Stateful browser capabilities use cohesive package-owned objects: `Local`, `Session`, `installationIdentity`, and Logger instances. Logger exposes the matching `debug`, `log`, `warn`, and `error` levels, defaults to the `debug` minimum, and receives scope on each method rather than storing it in child instances. `createLogger` returns isolated instances, while `configureLogger` only changes the default `logger` facade.
- Internal adapters and client factories are implementation details and are not public export paths.
- Removing a named function, changing Storage/ciphertext formats, raising the browser syntax target, or changing the Vue peer range requires an explicit major-version Breaking Change.

## 运行时与包契约

- 运行平台：ES2022 现代浏览器、WebView、Vue 3 应用和 uni-app。
- 包格式：包管理器使用单一公开具名导出 ESM 入口，CDN 使用单独压缩的 IIFE；不发布 CommonJS 或 UMD。
- Vue 边界：Vue 不会打进包管理器使用的构建产物，是 `^3.3.0` 的必需 Peer。
- uni-app：首次 Storage 操作或更早的 `configureStorage({ prefix })` 调用会检测全局 `uni`，并使用其同步 Storage API。
- Storage：直接从包导入 `Local` 和 `Session` 即可；只有覆盖默认值时才需在首次操作前调用 `configureStorage()`。
- Storage 单次覆盖：`set/get({ crypto })` 只为当前操作选择 JSON 或 Base64，不修改全局配置。v3 包络不记录 Codec，调用方必须对同一条目使用匹配的读写选项。
- Storage 读取类型：`get<Value = string>()` 未传泛型时默认推断为 `string | undefined`，Codec 在运行时仍恢复原始 JSON 值。
- 状态：Storage、Identity 与默认 Logger 配置按浏览器页面全局共享。Storage 和 Identity 的冲突配置明确抛错；`configureLogger` 替换默认 Logger 的配置，同时保持导出的门面引用稳定。
- 随机数：所有随机生成入口都优先使用 Web Crypto，缺失时回退到 `Math.random()`。
- 发布：根目录是唯一 npm 包，`dist/` 是唯一构建输出，`exports` 是完整公共路径白名单。

模块导入本身不读取 `window`、浏览器 Storage 或 `uni`，不具备对应平台能力时只在调用相关 API 时明确失败。

无状态能力统一使用具名导出。Base64 与 Crypto 文本解码入口返回原始字符串类型 `DecodedText`，可以直接作为字符串使用；JSON 只在显式调用 `.parseJson<T = any>()` 时解析。首次文本解码会按需安装不可枚举的 `String.prototype.parseJson`，若同名属性已被其他实现占用则拒绝覆盖并抛错。Storage Codec 继续自动解析 JSON。有状态浏览器能力使用 `Local`、`Session`、`installationIdentity` 和 Logger 实例；Logger 提供与 Sink 同名的 `debug`、`log`、`warn`、`error` 级别，默认最低级别为 `debug`，作用域随每次调用传入，不创建 Child Logger。`createLogger` 返回隔离实例，`configureLogger` 只修改默认 `logger` 门面。
