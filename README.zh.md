<p align="left">
	<strong>简体中文</strong> | <a href="./README.md">English</a>
</p>

<p align="center">
	<img src="./Fast.png" alt="logo" width="160" />
</p>

# @fast-china/utils

面向现代浏览器、WebView、Vue 2.7/3 与 uni-app 的 TypeScript 前端工具库。

[![npm 版本](https://img.shields.io/npm/v/@fast-china/utils?color=orange)](https://www.npmjs.com/package/@fast-china/utils) [![node](https://img.shields.io/badge/node-%5E22.18%20%7C%7C%20%5E24.18-brightgreen)](https://nodejs.org/) [![Vue](https://img.shields.io/badge/vue-%5E2.7%20%7C%7C%20%5E3.3-42b883)](https://vuejs.org/) [![开源协议](https://img.shields.io/npm/l/@fast-china/utils)](./LICENSE)

## 特性

- 提供完整类型、无副作用实现和统一具名导出入口，便于 Tree Shaking。
- 明确支持浏览器、WebView、Vue 2.7/3 与 uni-app，导入阶段不访问平台全局对象。
- 为 Storage、安装标识、编码、安全随机数与密码学能力划定清晰的安全边界。
- 使用 TypeScript 6 严格检查、ESLint、运行时测试、消费者类型测试、包契约与 Publint 共同验证。

## 安装

```bash
pnpm add @fast-china/utils
```

使用 Vue 工具时由应用安装 Vue：

```bash
pnpm add vue
```

Peer 范围为 Vue `^2.7.0 || ^3.3.0`。Vue 2.6 与 Vue 3.0-3.2 不在声明范围内。

## Storage

只在浏览器程序入口配置一次：

```ts
import { configureStorage } from "@fast-china/utils";

configureStorage({
	prefix: "my-app:",
});
```

其他业务文件直接引用包：

```ts
import { Local, Session } from "@fast-china/utils";

Local.set("user", { id: 1 }, { ttlMs: 30 * 60 * 1000 });
const user = Local.get<{ id: number }>("user");

Session.set("redirect", "/home");
```

首次配置后不可变；相同配置重复调用保持幂等，不同配置会抛错。

在 uni-app 中，同一配置会自动使用全局 `uni` 的同步 Storage API：

```ts
import { configureStorage } from "@fast-china/utils";

configureStorage({
	prefix: "my-app:",
});
```

uni-app 使用 `Local`；由于不存在等价的 sessionStorage，调用 `Session` 会明确抛错。`clear()` 只清理当前前缀。可选的 `base64StorageCodec` 只是可逆混淆，不是加密。

## Base64

新代码优先使用 UTF-8 或 Base64URL API：

```ts
import { decodeBase64, encodeBase64, encodeBase64Url } from "@fast-china/utils";

const encoded = encodeBase64("Fast 工具库");
decodeBase64(encoded);
encodeBase64Url("path/参数");
```

`encodeSecureBase64` / `decodeSecureBase64` 仅用于兼容旧字典格式。给定相同的默认 6 字符前缀时，有效旧载荷保持逐字符一致；历史字典无法自解码的 101–124 字符 Base64 区间使用旧删除流程可识别的单字符回退。它不是加密，不应用于密码、Token 或其他秘密。

## 安装实例标识

```ts
import { configureInstallationIdentity, getOrCreateInstallationId } from "@fast-china/utils";

configureInstallationIdentity({ cacheKey: "account:installation-id" });

const installationId = getOrCreateInstallationId();
```

在程序入口、首次使用安装标识前调用 `configureInstallationIdentity`。默认业务键是 `identity:installation-id`；相同配置可幂等重复调用，不同配置会抛错。安装标识使用已配置的 `Local` 和 Web Crypto UUID v4，不回退 `Math.random()`。它不是硬件 ID、认证凭证或风控信号。

## Vue 2.7 与 Vue 3

```ts
import { useEmits, useProps, withInstall } from "@fast-china/utils";
```

包内提供结构化插件注册，同时兼容 Vue 2.7 `Vue.use()` 与 Vue 3 `app.use()`，并提供 Composition API、Props/Emits/Slots 类型和 TSX 渲染。Vue 不会打进本包产物，并声明为可选 Peer Dependency。`makeSlots` 使用 Vue 3 官方 `SlotsType`，仅供 Vue 3 组件使用。

## 模块

`@fast-china/utils` 是唯一公开入口，全部 API 都通过具名导出提供。源码模块仍会在 `dist/` 中独立保留，便于现代打包器移除未使用代码，但这些内部文件不是公开子路径。

历史聚合对象不再公开，其功能全部通过具名函数提供，便于自动导入与 Tree Shaking。

## 运行时契约

- 仅纯 ESM，不提供 CommonJS、UMD 或 IIFE。
- 面向 ES2022 现代浏览器与 WebView。
- Vue 2.7 或 Vue 3 通过可选 Peer 接入。
- 配置 Storage 时自动检测全局 `uni` 并接入 uni-app。
- 导入阶段不访问 `window`、Storage 或 `uni`；不支持的调用明确失败。
- 不注入 Web Crypto、URL、Intl、TextEncoder 等 Polyfill。

## 文档

- [API 文档](./docs/API.zh-CN.md)
- [运行时契约](./docs/RUNTIME_CONTRACT.md)
- [开发与发布](./docs/DEVELOPMENT_RELEASE.zh-CN.md)
- [安全策略](./SECURITY.md)
- [贡献指南](./CONTRIBUTING.md)
- [更新日志](./CHANGELOG.md)

## 开发

开发工具链要求 Node.js `^22.18.0 || ^24.18.0` 与 pnpm `^11.0.0`。

```bash
pnpm install --frozen-lockfile
pnpm check
```

修改源码时可使用 `pnpm dev` 启动长期运行的 tsdown 监听构建。

## 许可证

[Apache-2.0](./LICENSE)
