<p align="left">
	<a href="./README.zh.md">简体中文</a> | <strong>English</strong>
</p>

<p align="center">
	<img src="./Fast.png" alt="logo" width="160" />
</p>

# @fast-china/utils

Browser-first TypeScript utilities for modern browsers, WebViews, Vue 2.7/3, and uni-app.

[![npm version](https://img.shields.io/npm/v/@fast-china/utils?color=orange)](https://www.npmjs.com/package/@fast-china/utils) [![node](https://img.shields.io/badge/node-%5E22.18%20%7C%7C%20%5E24.18-brightgreen)](https://nodejs.org/) [![vue](https://img.shields.io/badge/vue-%5E2.7%20%7C%7C%20%5E3.3-42b883)](https://vuejs.org/) [![license](https://img.shields.io/npm/l/@fast-china/utils)](./LICENSE)

## Highlights

- Typed, side-effect-free utilities with one named-export entry for effective Tree Shaking.
- Browser, WebView, Vue 2.7/3, and uni-app contracts without import-time platform access.
- Explicit security boundaries for storage, identity, encoding, random generation, and cryptography.
- TypeScript 6 strict checks, ESLint, runtime tests, consumer type tests, package validation, and Publint.

## Install

```bash
pnpm add @fast-china/utils
```

Install the optional Vue peer only when using Vue helpers:

```bash
pnpm add vue
```

Supported peer range: Vue `^2.7.0 || ^3.3.0`. Vue 2.6 and Vue 3.0-3.2 are outside the declared range.

## Storage

Configure storage exactly once from the browser application entry:

```ts
import { configureStorage } from "@fast-china/utils";

configureStorage({
	prefix: "my-app:",
});
```

Every other module imports the stable package exports directly:

```ts
import { Local, Session } from "@fast-china/utils";

Local.set("user", { id: 1 }, { ttlMs: 30 * 60 * 1000 });
const user = Local.get<{ id: number }>("user");

Session.set("redirect", "/home");
```

The configuration is immutable after the first call. Repeating the same configuration is idempotent; a conflicting configuration throws.

In uni-app, the same configuration automatically uses the global `uni` synchronous Storage API:

```ts
import { configureStorage } from "@fast-china/utils";

configureStorage({
	prefix: "my-app:",
});
```

uni-app uses `Local`; `Session` throws because uni-app has no sessionStorage equivalent. `clear()` removes only keys inside the configured prefix. The optional `base64StorageCodec` is reversible obfuscation, not encryption.

## Base64

Prefer the UTF-8 or Base64URL APIs in new code:

```ts
import { decodeBase64, encodeBase64, encodeBase64Url } from "@fast-china/utils";

const encoded = encodeBase64("Fast utilities");
decodeBase64(encoded);
encodeBase64Url("path/value");
```

`encodeSecureBase64` and `decodeSecureBase64` exist only for the legacy dictionary format. Given the same default six-character prefix, valid legacy payloads remain byte-for-byte identical. A historical Base64-length 101–124 dictionary gap uses a one-character fallback that the legacy removal flow understands. This format is not encryption and must not protect passwords, tokens, or other secrets.

## Identity

```ts
import { configureInstallationIdentity, getOrCreateInstallationId } from "@fast-china/utils";

configureInstallationIdentity({ cacheKey: "account:installation-id" });

const installationId = getOrCreateInstallationId();
```

Call `configureInstallationIdentity` in the application entry before first use. The default business key is `identity:installation-id`; repeated identical configuration is idempotent and conflicting configuration throws. Installation Identity uses the configured `Local` storage and Web Crypto UUID v4 generation. It never falls back to `Math.random()`.

## Vue 2.7 and Vue 3

```ts
import { useEmits, useProps, withInstall } from "@fast-china/utils";
```

The package provides structural plugin registration compatible with Vue 2.7 `Vue.use()` and Vue 3 `app.use()`, Composition API helpers, typed props/emits/slots, and TSX rendering. Vue remains external to the bundle and is declared as an optional peer dependency. `makeSlots` uses Vue 3's official `SlotsType` and is intended for Vue 3 components.

## Modules

`@fast-china/utils` is the only public entry and exposes every API as a named export. Source modules remain separate in `dist/` so modern bundlers can remove unused exports; those internal files are not public package subpaths.

Historical aggregate objects are not public. Their behavior is available through named functions, improving auto-imports and Tree Shaking.

## Runtime contract

- Pure ESM; no CommonJS, UMD, or IIFE.
- ES2022 modern browsers and WebViews.
- Vue 2.7 or Vue 3 through an optional peer.
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
