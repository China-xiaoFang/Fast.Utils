# Fast.Utils API

Fast.Utils 是面向浏览器的 ES2022 工具包；包管理器使用 ESM 入口，CDN 使用单独压缩的 IIFE 入口。应用环境包括现代浏览器、WebView、Vue 3 和 uni-app。

## 导入

包只提供一个公开根入口，包含普通工具和 Vue Helper 在内的全部 API 均使用具名导出。

```ts
import { chunk, configureStorage, installationIdentity, Local } from "@fast-china/utils";
```

内部 Helper 不提供公共子路径。库不再导出工具聚合对象，调用方应直接导入具名函数，以便 Tree Shaking。

## Storage

`Local` 和 `Session` 会以旧版兼容的 `fast__` 前缀、JSON Codec 与 `Date.now` 延迟初始化。除非需要覆盖默认值，否则无需调用 `configureStorage`。

```ts
import { Local, Session } from "@fast-china/utils";

Local.set("profile", { name: "Ada" }, { ttlMs: 3_600_000 });
Session.set("draft", { step: 2 });
```

`Local` 和 `Session` 提供 `get`、`set`、`has`、`remove`、`removeByPrefix`、`keys`、`pruneExpired` 和仅清理当前命名空间的 `clear`。键缺失或过期时返回 `undefined`。TTL 非法、Prefix 为空、存储包络损坏、平台 Storage 不可用或重复配置发生冲突时抛出错误；浏览器配额与隐私策略错误直接向上传播。自定义选项必须在首次 Storage 操作前配置。

uni-app 中，首次 Storage 操作或显式调用 `configureStorage` 会自动检测全局 `uni` 并使用其同步 Storage API。uni-app 没有独立 Session 后端，因此该模式调用 `Session` 会明确抛错。

```ts
import { Local } from "@fast-china/utils";

Local.set("token", "value");
```

`configureStorage({ prefix: "admin:", crypto: true })` 恢复了旧版全局前缀与 Base64 混淆选项。`crypto: true` 和 `base64StorageCodec` 都只是可逆编码，不是加密，不能保护敏感数据。可以使用自定义 `codec` 替代 `crypto`。

`encodeSecureBase64` 与 `decodeSecureBase64` 保留旧字典兼容载荷。随机前缀优先使用 Web Crypto，能力缺失时回退到 `Math.random()`；它不承担安全用途。给定相同的默认 6 字符前缀时，有效旧载荷保持逐字符兼容；旧字典在 Base64 长度 101–124 时会引用越界，当前实现使用单字符回退，旧删除字典流程仍可解码。旧自定义长度参数始终生成 6 个随机字符，当前 API 已按 `prefixLength` 正确生成。自定义 `prefixLength` 必须在编码和解码时保持一致；传入 `0` 会同时关闭随机前缀与字典插入。该格式仍是可逆编码，不等同于加密。

## Identity

`installationIdentity` 是全局安装标识门面。可在程序入口、首次使用前调用 `configureInstallationIdentity` 覆盖默认缓存键 `identity:installation-id`。`getOrCreateInstallationId(installationId?)` 会通过 `Local` 读取、生成或替换 UUID v4；未显式配置 Storage 时使用其默认值。UUID 优先使用 Web Crypto 生成，能力缺失时回退到 `Math.random()`。

```ts
import { configureInstallationIdentity, configureStorage, getOrCreateInstallationId, installationIdentity } from "@fast-china/utils";

configureStorage({ prefix: "app:" });
configureInstallationIdentity({ cacheKey: "account:installation-id" });
getOrCreateInstallationId();
installationIdentity.read();
installationIdentity.clear();
```

这个 ID 只标识当前存储空间中的安装实例，不是硬件标识、认证凭证、秘密或反欺诈信号。

## Logger

Logger 作用域属于每条日志，不保存在可变 Logger 或 Child 实例中：

```ts
import { logger } from "@fast-china/utils";

logger.info("storage", "profile loaded", { userId: 1 });
logger.error("network", "request failed", error);
```

`createLogger` 只配置最低级别、品牌前缀、Sink 和可选的 uni-app App-Plus 拆分输出。作用域必须是无外围空白的非空字符串。

## 剪贴板

`copy(value)` 恢复 V1 的文本复制能力，并返回 `Promise<void>`。uni-app 使用 `setClipboardData`；浏览器优先使用 Clipboard API，不可用时回退到 `document.execCommand("copy")`。平台能力缺失、权限被拒绝或复制失败时会抛出错误。

```ts
import { copy } from "@fast-china/utils";

await copy("Fast 工具库");
```

## Crypto

TypeScript Crypto 公共 API 与 .NET `CryptoUtil` 的公开方法及算法名称大小写保持一致：

| 能力                     | 两端统一的方法名                                                                                                                     |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| 随机字节与字节比较       | `GenerateRandomBytes`、`FixedTimeEquals`                                                                                             |
| MD5、SHA-1 与 SHA-2 摘要 | `MD5Encrypt`、`SHA1Encrypt`、`SHA256Encrypt`、`SHA256Bytes`、`SHA384Encrypt`、`SHA384Bytes`、`SHA512Encrypt`、`SHA512Bytes`          |
| HMAC                     | `HMACSHA256Encrypt`、`HMACSHA384Encrypt`、`HMACSHA512Encrypt`                                                                        |
| 密码派生与密码哈希       | `PBKDF2SHA256`、`HashPasswordPBKDF2SHA256`、`VerifyPasswordPBKDF2SHA256`                                                             |
| HKDF                     | `HKDFSHA256`                                                                                                                         |
| AES                      | `AESEncrypt`、`AESDecrypt`、`AESEncryptAuthenticated`、`AESDecryptAuthenticated`、`AESEncryptWithPassword`、`AESDecryptWithPassword` |
| RSA                      | `GenerateRSAKeyPair`、`RSAEncryptOAEP`、`RSADecryptOAEP`、`RSASignPSS`、`RSAVerifyPSS`                                               |
| 椭圆曲线                 | `GenerateECDSAKeyPair`、`ECDSASign`、`ECDSAVerify`、`GenerateECDHKeyPair`、`DeriveECDHSecret`、`DeriveECDHKeySHA256`                 |

`AESEncryptAuthenticated` 的 Base64 v1 载荷、`AESEncryptWithPassword` 的 `FAST-AES-256-GCM-V1` 载荷、PBKDF2 密码哈希以及 PKCS#8/SPKI PEM 密钥均可与 .NET 双向使用。MD5 与 HMAC 输出小写十六进制；SHA-1/256/384/512 输出大写十六进制，与 .NET 保持一致。

密码存储使用 `HashPasswordPBKDF2SHA256` 和 `VerifyPasswordPBKDF2SHA256`；该哈希不可解密。需要同时保证机密性和完整性的文本使用 AES-GCM 入口。HMAC 用于共享密钥认证，SHA-2 用于摘要，HKDF/PBKDF2 用于密钥派生。MD5、SHA-1、AES-CBC 和 AES-ECB 不提供现代密码存储或认证加密保证。

## 模块

- `array`：分块、压缩、去重、分组、分区、差集、交集和一致性判断。
- `async`：支持取消的 Sleep、超时、重试、受限并发映射、防抖和节流。
- `base64`：严格 UTF-8 Base64/Base64URL 字节与文本函数，以及 Latin-1 和 SecureBase64 兼容函数。
- `color`：颜色解析、格式化、混合、明暗、亮度和对比度。
- `crypto`：随机字节、摘要、HMAC、PBKDF2、HKDF、AES、RSA-OAEP/PSS、ECDSA 和 ECDH。
- `date`：日期校验、加减、日范围、相对时间，以及七个历史日期功能的具名函数。
- `dom`：CSS 单位和 Style 序列化。
- `env`：能力与 User-Agent 检测；检测函数不扩大运行时支持范围。
- `logger`：隔离的可配置 Logger 和默认 `logger`。
- `number`：范围、舍入、聚合、插值、字节格式化，以及优先使用 Web Crypto 的 `randomInt`。
- `object`：防原型污染的选择、比较、映射和 Query 序列化；Style 序列化由 `dom` 模块提供。
- `string`：Query 解析、大小写、字素截断、剪贴板复制、UUID、优先使用 Web Crypto 的 `randomString`、转义和空白规范化。
- `vue`：Vue 3 的 Composition API、类型、Render 和 `app.use()` 注册 Helper。

## 安全与限制

AES-GCM 提供机密性和完整性；AES-CBC/ECB 不提供认证。MD5、SHA-1 和历史 Base64 字典不能用于密码存储、签名或受保护数据。Crypto API 按算法限制参数和载荷大小，并在需要时强制要求 Web Crypto。

Query 与 Object API 拒绝原型污染键，URL 解码有最大深度，Storage 清理只作用于配置的命名空间。浏览器全局对象只在调用 API 时解析，模块导入阶段不会访问。

## 错误与兼容性

除明确说明返回空值的函数外，编程错误、非法输入、平台能力缺失和受保护数据损坏均抛出原生错误。

`randomInt`、`randomString`、`generateUuidV4` 与 `GenerateRandomBytes` 默认都优先使用 Web Crypto，能力缺失时回退到 `Math.random()`。

Fast.Utils 2.1.0 已删除 `secureRandomInt` 与 `secureRandomString`，这是破坏性修改；调用方应分别改用 `randomInt` 与 `randomString`。
