# Fast.Utils API

Fast.Utils 是面向浏览器的纯 ESM 工具包，语法目标为 ES2022，应用环境包括现代浏览器、WebView、Vue 2.7/3 和 uni-app。

## 导入

包只提供一个公开根入口，包含普通工具和 Vue Helper 在内的全部 API 均使用具名导出。

```ts
import { chunk, configureStorage, installationIdentity, Local } from "@fast-china/utils";
```

内部 Helper 不提供公共子路径。库不再导出工具聚合对象，调用方应直接导入具名函数，以便 Tree Shaking。

## Storage

在程序入口调用一次 `configureStorage`，其余业务文件直接从包中导入 `Local` 或 `Session`。

```ts
import { configureStorage, Local, Session } from "@fast-china/utils";

configureStorage({ prefix: "admin:" });

Local.set("profile", { name: "Ada" }, { ttlMs: 3_600_000 });
Session.set("draft", { step: 2 });
```

`Local` 和 `Session` 提供 `get`、`set`、`has`、`remove`、`removeByPrefix`、`keys`、`pruneExpired` 和仅清理当前命名空间的 `clear`。键缺失或过期时返回 `undefined`。TTL 非法、Prefix 为空、存储包络损坏、平台 Storage 不可用或重复配置发生冲突时抛出错误；浏览器配额与隐私策略错误直接向上传播。

uni-app 中，`configureStorage` 会自动检测全局 `uni` 并使用其同步 Storage API。uni-app 没有独立 Session 后端，因此该模式调用 `Session` 会明确抛错。

```ts
import { configureStorage, Local } from "@fast-china/utils";

configureStorage({ prefix: "mini:" });
Local.set("token", "value");
```

可以通过 `codec` 注入自定义 Codec。`base64StorageCodec` 只是可逆混淆，不是加密。

`encodeSecureBase64` 与 `decodeSecureBase64` 保留旧字典兼容载荷，并使用 Web Crypto 生成安全随机前缀。给定相同的默认 6 字符前缀时，有效旧载荷保持逐字符兼容；旧字典在 Base64 长度 101–124 时会引用越界，当前实现使用单字符回退，旧删除字典流程仍可解码。旧自定义长度参数始终生成 6 个随机字符，当前 API 已按 `prefixLength` 正确生成。自定义 `prefixLength` 必须在编码和解码时保持一致；传入 `0` 会同时关闭随机前缀与字典插入。该格式仍是可逆编码，不等同于加密。

## Identity

`installationIdentity` 是全局安装标识门面。可在程序入口、首次使用前调用 `configureInstallationIdentity` 覆盖默认缓存键 `identity:installation-id`。`getOrCreateInstallationId(installationId?)` 会通过已配置的 `Local` 读取、生成或替换 UUID v4。必须先调用 `configureStorage`。UUID 生成依赖 Web Crypto，不会回退到 `Math.random()`。

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

## 模块

- `array`：分块、压缩、去重、分组、分区、差集、交集和一致性判断。
- `async`：支持取消的 Sleep、超时、重试、受限并发映射、防抖和节流。
- `base64`：严格 UTF-8 Base64/Base64URL 字节与文本函数，以及 Latin-1 和 SecureBase64 兼容函数。
- `color`：颜色解析、格式化、混合、明暗、亮度和对比度。
- `crypto`：安全随机、哈希、AES 兼容函数、认证密码加密、RSA-OAEP、ECDSA 和 ECDH。
- `date`：日期校验、加减、日范围、相对时间，以及七个历史日期功能的具名函数。
- `dom`：CSS 单位和 Style 序列化。
- `env`：能力与 User-Agent 检测；检测函数不扩大运行时支持范围。
- `logger`：隔离的可配置 Logger 和默认 `logger`。
- `number`：范围、舍入、聚合、插值、字节格式化和安全随机整数。
- `object`：防原型污染的选择、比较、映射和 Query 序列化；Style 序列化由 `dom` 模块提供。
- `string`：Query 解析、大小写、字素截断、UUID、安全随机文本、转义和空白规范化。
- `vue`：Vue 2.7/3 的 Composition API、类型、Render 和注册 Helper；使用官方 `SlotsType` 的 `makeSlots` 仅供 Vue 3 使用。

## 安全与限制

新受保护载荷应使用认证密码加密。AES-CBC/ECB、MD5、SHA-1 和历史 Base64 字典仅用于协议兼容，不能描述为现代认证加密。Crypto API 按算法限制参数和载荷大小，并在需要时强制要求 Web Crypto。

Query 与 Object API 拒绝原型污染键，URL 解码有最大深度，Storage 清理只作用于配置的命名空间。浏览器全局对象只在调用 API 时解析，模块导入阶段不会访问。

## 错误与兼容性

除明确说明返回空值的函数外，编程错误、非法输入、平台能力缺失和受保护数据损坏均抛出原生错误。
