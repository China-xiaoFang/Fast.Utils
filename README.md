<p align="left">
	<a href="./README.zh.md">简体中文</a> | <strong>English</strong>
</p>

<p align="center">
	<img src="./Fast.png" alt="logo" width="160" />
</p>

# @fast-china/utils

Browser-first TypeScript utilities for modern browsers, WebViews, Vue 3, and uni-app.

[![npm version](https://img.shields.io/npm/v/@fast-china/utils?color=orange)](https://www.npmjs.com/package/@fast-china/utils) [![node](https://img.shields.io/badge/node-%5E22.18%20%7C%7C%20%5E24.18-brightgreen)](https://nodejs.org/) [![vue](https://img.shields.io/badge/vue-%5E3.3-42b883)](https://vuejs.org/) [![license](https://img.shields.io/npm/l/@fast-china/utils)](./LICENSE)

## Highlights

- Typed, side-effect-free utilities with one named-export entry for effective Tree Shaking.
- Browser, WebView, Vue 3, and uni-app contracts without import-time platform access.
- Explicit security boundaries for storage, identity, encoding, random generation, and cryptography.
- TypeScript 6 strict checks, ESLint, runtime tests, consumer type tests, package validation, and Publint.

## Install

```bash
pnpm add @fast-china/utils
```

### CDN

The `unpkg` and `jsdelivr` fields select the minified `dist/index.global.min.js` browser file, which exposes the `FastUtils` global.

## Storage

`Local` and `Session` work without configuration. The default prefix is `fast__`, values use JSON, and entries do not expire unless a TTL is supplied:

```ts
import { Local, Session } from "@fast-china/utils";

Local.set("user", { id: 1 }, { ttlMs: 30 * 60 * 1000 });
const user = Local.get<{ id: number }>("user");

Local.set("private-user", { id: 2 }, { crypto: true });
const privateUser = Local.get<{ id: number }>("private-user", { crypto: true });

Session.set("redirect", "/home");
const redirect = Session.get("redirect"); // string | undefined
```

`get<Value = string>()` returns `string | undefined` when its generic is omitted, so string values require no type argument. Storage codecs still deserialize JSON at runtime; pass an explicit generic for an accurate type when the stored value is an object, array, or another non-string value.

Call `configureStorage` before the first Storage operation only when overriding defaults. The legacy-compatible `crypto` option applies reversible Base64 obfuscation; it is not encryption and must not protect secrets:

```ts
import { configureStorage } from "@fast-china/utils";

configureStorage({
	prefix: "my-app:",
	crypto: true,
});
```

The active global configuration is immutable. Repeating the same configuration is idempotent; a conflicting configuration throws. The `crypto` option on `set/get` overrides only that operation and must match when writing and reading the same entry; it does not mutate global configuration. A custom `codec` may be supplied instead of global `crypto`. In uni-app, `Local` automatically uses the global synchronous Storage API; `Session` throws because uni-app has no sessionStorage equivalent. `clear()` removes only keys inside the active prefix.

## Base64

Prefer the UTF-8 or Base64URL APIs in new code:

```ts
import { decodeBase64, encodeBase64, encodeBase64Url } from "@fast-china/utils";

const encoded = encodeBase64('{"name":"Fast utilities"}');
const decoded = decodeBase64(encoded);
decoded;
decoded.parseJson<{ name: string }>();
encodeBase64Url("path/value");
```

`encodeSecureBase64` and `decodeSecureBase64` exist only for the legacy dictionary format. Given the same default six-character prefix, valid legacy payloads remain byte-for-byte identical. A historical Base64-length 101–124 dictionary gap uses a one-character fallback that the legacy removal flow understands. This format is not encryption and must not protect passwords, tokens, or other secrets.

## Copy text

```ts
import { copy } from "@fast-china/utils";

await copy("Fast utilities");
```

uni-app uses `setClipboardData`. Browsers prefer the Clipboard API and fall back to the legacy browser copy capability when it is unavailable. Unsupported platforms and denied clipboard access throw errors.

## Identity

```ts
import { configureInstallationIdentity, getOrCreateInstallationId } from "@fast-china/utils";

configureInstallationIdentity({ cacheKey: "account:installation-id" });

const installationId = getOrCreateInstallationId();
```

Call `configureInstallationIdentity` in the application entry before first use. The default business key is `identity:installation-id`; repeated identical configuration is idempotent and conflicting configuration throws. Installation Identity UUID generation prefers Web Crypto and falls back to `Math.random()` when unavailable.

## Logger

The default `logger` works without construction and has a minimum level of `debug`. Enable split mode at application startup when uni-app App-Plus needs HBuilderX-compatible object output:

```ts
import { configureLogger, logger } from "@fast-china/utils";

configureLogger({ uniAppPlusSplit: true });
logger.log("Launch", { code: 200, data: { id: 1 } });
logger.error("Request", "request failed", error);
```

Log messages are optional, so objects, arrays, errors, and other values may be passed directly. Normal runtimes preserve the original values; App-Plus
split mode converts additional values into readable text one at a time. Use `createLogger` for an isolated configuration unaffected by the default Logger.

## Crypto

The TypeScript Crypto API mirrors the public methods and algorithm casing of .NET `CryptoUtil`. AES-GCM payloads, password-based AES payloads, PBKDF2 password hashes, and PEM keys interoperate across both implementations.

```ts
import { AESDecryptWithPassword, AESEncryptWithPassword } from "@fast-china/utils";

const payload = await AESEncryptWithPassword("protected content", "correct horse battery staple");
const plaintext = await AESDecryptWithPassword(payload, "correct horse battery staple");
plaintext;

const jsonPayload = await AESEncryptWithPassword('{"id":1}', "correct horse battery staple");
const result = (await AESDecryptWithPassword(jsonPayload, "correct horse battery staple")).parseJson<{ id: number }>();
```

Base64 and Crypto text decoding/decryption functions return the primitive-string `DecodedText` type, which can be used directly as a `string`; an explicit `.parseJson<T = any>()` call attempts JSON parsing and returns the original string when parsing fails. The first text decode lazily installs a non-enumerable `String.prototype.parseJson`; a foreign method with the same name causes an explicit conflict error. The generic type does not validate untrusted JSON or guarantee an object result at runtime.

Store passwords with `HashPasswordPBKDF2SHA256` and `VerifyPasswordPBKDF2SHA256`. MD5, SHA-1, AES-CBC, and AES-ECB do not provide password-storage or authenticated-encryption guarantees. See the [API reference](./docs/API.md#crypto) for the complete method list and security boundaries.

## Vue 3

```ts
import { useEmits, useProps, withInstall } from "@fast-china/utils";
```

The package provides Vue 3 `app.use()` registration, Composition API helpers, typed props/emits/slots, and TSX rendering. Vue remains external to the build and is required as a peer dependency.

## Modules

`@fast-china/utils` is the only public entry and exposes every API as a named export. Source modules remain separate in `dist/` so modern bundlers can remove unused exports; those internal files are not public package subpaths.

Historical aggregate objects are not public. Supported behavior is exposed through named functions, improving auto-imports and Tree Shaking; this major version does not preserve every former convenience method.

## Runtime contract

- The package-manager entry is pure ESM; the CDN entry is a separately minified IIFE.
- ES2022 modern browsers and WebViews.
- Vue 3.3 or newer through a required peer dependency.
- uni-app through automatic global `uni` detection when Storage is configured.
- No import-time access to `window`, Storage, or `uni`; unsupported calls fail explicitly.
- Web Crypto, URL, Intl, TextEncoder, and related platform capabilities are not polyfilled.

## Documentation

- [API reference](./docs/API.md)
- [Runtime contract](./docs/RUNTIME_CONTRACT.md)
- [Development and release guide (Chinese)](./docs/DEVELOPMENT_RELEASE.zh-CN.md)
- [Security policy](./SECURITY.md)
- [Contributing guide](./CONTRIBUTING.md)
- [Changelog](./CHANGELOG.md)

## Development

Development requires Node.js `^22.18.0 || ^24.18.0` and pnpm `^11.0.0`.

```bash
pnpm install --frozen-lockfile
pnpm check
```

Use `pnpm dev` for a long-running tsdown watch build while editing source files.

## License

[Apache-2.0](./LICENSE)
