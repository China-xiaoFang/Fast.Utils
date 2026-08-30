<p align="left">
	<strong>简体中文</strong> | <a href="./README.md">English</a>
</p>

<p align="center">
	<img src="./Fast.png" alt="logo" width="160" />
</p>

# @fast-china/utils

面向现代浏览器、WebView、Vue 3 与 uni-app 的 TypeScript 前端工具库。

[![npm 版本](https://img.shields.io/npm/v/@fast-china/utils?color=orange)](https://www.npmjs.com/package/@fast-china/utils) [![node](https://img.shields.io/badge/node-%5E22.18%20%7C%7C%20%5E24.18-brightgreen)](https://nodejs.org/) [![Vue](https://img.shields.io/badge/vue-%5E3.3-42b883)](https://vuejs.org/) [![开源协议](https://img.shields.io/npm/l/@fast-china/utils)](./LICENSE)

## 特性

- 提供完整类型、无副作用实现和统一具名导出入口，便于 Tree Shaking。
- 明确支持浏览器、WebView、Vue 3 与 uni-app，导入阶段不访问平台全局对象。
- 为 Storage、安装标识、编码、随机数与密码学能力划定清晰的安全边界。
- 使用 TypeScript 6 严格检查、ESLint、运行时测试、消费者类型测试、包契约与 Publint 共同验证。

## 安装

```bash
pnpm add @fast-china/utils
```

### CDN

`unpkg` 和 `jsdelivr` 字段都指向压缩后的浏览器文件 `dist/index.global.min.js`，全局变量为 `FastUtils`。

## Storage

`Local` 和 `Session` 无需配置即可使用。默认前缀为 `fast__`，值使用 JSON 编码，未指定 TTL 时永久有效：

```ts
import { Local, Session } from "@fast-china/utils";

Local.set("user", { id: 1 }, { ttlMs: 30 * 60 * 1000 });
const user = Local.get<{ id: number }>("user");

Local.set("private-user", { id: 2 }, { crypto: true });
const privateUser = Local.get<{ id: number }>("private-user", { crypto: true });

Session.set("redirect", "/home");
const redirect = Session.get("redirect"); // string | undefined
```

`get<Value = string>()` 未传泛型时默认返回 `string | undefined`，因此字符串场景可以直接调用。Storage Codec 仍会在运行时执行 JSON 反序列化；若存储的是对象、数组或其他非字符串值，建议显式传入对应泛型以获得准确类型。

只有需要覆盖默认值时，才需在首次 Storage 操作前调用 `configureStorage`。兼容旧版的 `crypto` 选项只执行可逆 Base64 混淆，不是加密，不能保护敏感数据：

```ts
import { configureStorage } from "@fast-china/utils";

configureStorage({
	prefix: "my-app:",
	crypto: true,
});
```

激活后的全局配置不可变；相同配置重复调用保持幂等，不同配置会抛错。`set/get` 的 `crypto` 选项只覆盖单次操作，读写同一条目时必须保持一致，不会改变全局配置。自定义 `codec` 与全局 `crypto` 不能同时使用。uni-app 中 `Local` 会自动使用全局同步 Storage API；由于没有等价的 sessionStorage，`Session` 会明确抛错。`clear()` 只清理当前前缀。

## Base64

新代码优先使用 UTF-8 或 Base64URL API：

```ts
import { decodeBase64, encodeBase64, encodeBase64Url } from "@fast-china/utils";

const encoded = encodeBase64('{"name":"Fast 工具库"}');
const decoded = decodeBase64(encoded);
decoded;
decoded.parseJson<{ name: string }>();
encodeBase64Url("path/参数");
```

`encodeSecureBase64` / `decodeSecureBase64` 仅用于兼容旧字典格式。给定相同的默认 6 字符前缀时，有效旧载荷保持逐字符一致；历史字典无法自解码的 101–124 字符 Base64 区间使用旧删除流程可识别的单字符回退。它不是加密，不应用于密码、Token 或其他秘密。

## 复制文本

```ts
import { copy } from "@fast-china/utils";

await copy("Fast 工具库");
```

uni-app 使用 `setClipboardData`；浏览器优先使用 Clipboard API，不可用时回退到旧版浏览器复制能力。平台不支持或拒绝访问剪贴板时会抛出错误。

## 安装实例标识

```ts
import { configureInstallationIdentity, getOrCreateInstallationId } from "@fast-china/utils";

configureInstallationIdentity({ cacheKey: "account:installation-id" });

const installationId = getOrCreateInstallationId();
```

在程序入口、首次使用安装标识前调用 `configureInstallationIdentity`。默认业务键是 `identity:installation-id`；相同配置可幂等重复调用，不同配置会抛错。安装标识 UUID 优先使用 Web Crypto 生成，能力缺失时回退到 `Math.random()`。它不是硬件 ID、认证凭证或风控信号。

## Logger

默认 `logger` 可以直接使用，最低输出级别为 `debug`。uni-app App-Plus 需要兼容 HBuilderX 对象输出时，在应用入口配置拆分模式：

```ts
import { configureLogger, logger } from "@fast-china/utils";

configureLogger({ uniAppPlusSplit: true });
logger.log("Launch", { code: 200, data: { id: 1 } });
logger.error("Request", "请求失败", error);
```

日志消息可以省略，对象、数组和错误等值可以直接传入。普通环境保留原始值；App-Plus 拆分模式会将附加值逐条转换为可读文本。
需要独立配置且不受默认 Logger 影响时使用 `createLogger`。

## Crypto

TypeScript Crypto API 与 .NET `CryptoUtil` 的公开方法及算法名称大小写保持一致。AES-GCM、密码 AES 载荷、PBKDF2 密码哈希和 PEM 密钥支持两端互操作。

```ts
import { AESDecryptWithPassword, AESEncryptWithPassword } from "@fast-china/utils";

const payload = await AESEncryptWithPassword("受保护内容", "correct horse battery staple");
const plaintext = await AESDecryptWithPassword(payload, "correct horse battery staple");
plaintext;

const jsonPayload = await AESEncryptWithPassword('{"id":1}', "correct horse battery staple");
const result = (await AESDecryptWithPassword(jsonPayload, "correct horse battery staple")).parseJson<{ id: number }>();
```

Base64 与 Crypto 的文本解码/解密入口返回原始字符串类型 `DecodedText`，可以直接作为 `string` 使用；只有显式调用 `.parseJson<T = any>()` 才解析 JSON。首次文本解码会按需安装不可枚举的 `String.prototype.parseJson`，若同名方法已被其他实现占用则明确抛错。泛型不会验证不可信 JSON 的实际结构。

密码存储使用 `HashPasswordPBKDF2SHA256` 和 `VerifyPasswordPBKDF2SHA256`。MD5、SHA-1、AES-CBC 与 AES-ECB 不提供密码存储或认证加密保证。完整方法列表和安全边界见 [API 文档](./docs/API.zh-CN.md#crypto)。

## Vue 3

```ts
import { useEmits, useProps, withInstall } from "@fast-china/utils";
```

包内提供 Vue 3 `app.use()` 注册、Composition API Helper、Props/Emits/Slots 类型和 TSX 渲染。Vue 不会打进构建产物，并作为必须安装的 Peer Dependency。

## 模块

`@fast-china/utils` 是唯一公开入口，全部 API 都通过具名导出提供。源码模块仍会在 `dist/` 中独立保留，便于现代打包器移除未使用代码，但这些内部文件不是公开子路径。

历史聚合对象不再公开，继续支持的能力通过具名函数提供，便于自动导入与 Tree Shaking；当前大版本并未保留每一个旧版便捷方法。

## 运行时契约

- 包管理器入口为纯 ESM；CDN 入口为单独压缩的 IIFE。
- 面向 ES2022 现代浏览器与 WebView。
- Vue 3.3 及以上版本通过必须安装的 Peer Dependency 接入。
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
