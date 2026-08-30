# Changelog

All notable changes to Fast.Utils are documented in this file.

## [2.1.2] - 2026-08-30

### Added

- Added per-operation Storage `crypto` overrides for `Local` and `Session` reads and writes without mutating global configuration.
- Added chainable `.parseJson<T = any>()` access to primitive string results from Base64 and Crypto text decoding APIs.
- Added `configureLogger` for the default Logger and allowed Logger severity methods to emit data without a message string.

### Breaking Changes

- Replaced Logger's `info` method and level with `log`; `logger.log()` now maps directly to `sink.log()` and `console.log()`, and the default minimum level is now `debug`.
- Changed the default type parameter of `StorageArea.get` from `unknown` to `string`; runtime codec results remain unchanged and may still be objects or other JSON values.
- Refined `decodeBase64`, `decodeBase64Url`, `decodeLatin1Base64`, `decodeSecureBase64`, `AESDecrypt`, `AESDecryptAuthenticated`, `AESDecryptWithPassword`, and `RSADecryptOAEP` results to the primitive-string `DecodedText` type. The first text decode installs a non-enumerable `String.prototype.parseJson`; an existing foreign implementation causes an explicit conflict error instead of being overwritten.

## [2.1.1] - 2026-08-26

### Changed

- Localized built-in validation, platform-capability, storage, cryptography, clipboard, and Vue integration error messages to Chinese while preserving their native error types and causes.
- Narrowed the `useProps` return type so keys passed through `ignoredProps` are excluded from the inferred computed result.
- Synchronized the self-contained ESLint Flat Config with the applicable Fast.ESLint.Config source rules and comments, refreshed compatible development dependencies, and documented the VS Code recommendations.

## [2.1.0] - 2026-08-23

### Added

- Restored the V1 `copy` text clipboard API for browsers and uni-app.

### Changed

- Added `randomInt` and `randomString` as the random APIs.
- Standardized every random generation entry to prefer Web Crypto and fall back to `Math.random()` when unavailable.
- Accessed standard runtime capabilities directly through `globalThis` instead of maintaining asserted global-object views.

### Breaking Changes

- Removed `secureRandomInt` and `secureRandomString`; use `randomInt` and `randomString` instead.

## [2.0.3] - 2026-08-11

### Changed

- Established `FAST-AES-256-GCM-V1` as the initial cross-language password-based AES payload.

## [2.0.2] - 2026-08-09

### Changed

- Added prioritized import path groups for the uni-app, Vue, Element Plus, Fast Element Plus, Fast China, and Lodash ecosystems while keeping type-only imports in the dedicated type group.
- Changed import group spacing to a compact no-blank-line style and normalized the repository imports to the new policy.

## [2.0.1] - 2026-08-09

### Added

- Expanded the cryptography API with digest, HMAC, PBKDF2, HKDF, authenticated AES, RSA, ECDSA, and ECDH compatibility helpers and synchronized bilingual API documentation.
- Added a separately minified `dist/index.global.min.js` browser build of the root entry, selected by the `unpkg` and `jsdelivr` package fields.

### Changed

- Standardized the Fast package keywords and publish allowlist while excluding `src` from the npm archive.
- Kept the package-manager ESM build unminified, kept Vue external in both builds, and removed declaration maps that referenced unpublished source files.
- Made Vue a required peer dependency while keeping it external to the package-manager build.
- Dropped Vue 2.7 compatibility and made Vue 3.3+ the sole supported framework range.
- Aligned the Crypto API exactly with Fast.NET `CryptoUtil`, removed transitional aliases and wrappers, and matched .NET digest casing.
- Consolidated the ESM and minified IIFE builds into one `tsdown.config.ts` configuration array.
- Restored zero-configuration `Local` and `Session` access with the legacy `fast__` prefix and a compatibility `crypto` option for the former Base64-obfuscation behavior.
- Focused package tests on public entries, executable CDN output, self-contained runtime source maps, and the final npm archive instead of fixed dependency versions and size thresholds.

## [2.0.0] - 2026-08-03

### Added

- Named utilities for arrays, asynchronous control flow, Base64, colors, cryptography, dates, DOM styles, environment detection, identity, logging, numbers, objects, storage, and strings.
- Promise-aware cancellation, timeout, retry, bounded concurrency, debounce, and throttle primitives.
- Strict Base64/Base64URL, secure random generation, authenticated password encryption, RSA-OAEP, ECDSA, ECDH, and protocol-compatibility hash/AES functions.
- Browser and automatically detected uni-app Storage with TTL, codecs, namespace isolation, and cleanup.
- Optional Vue 2.7/3 entry with Composition API, typed emits/props/slots, render, and install helpers.
- Pure ESM ES2022 publishing with exact public subpaths, one root package, and one root `dist/` directory.
- Runtime, type-consumer, package-contract, Source Map, Tree Shaking, package-size, Publint, and CI validation.

### Security

- Added authenticated ciphertext validation, bounded crypto parameters and payloads, unbiased Web Crypto randomness, prototype-safe query/object transforms, and namespace-scoped Storage cleanup.

[2.1.2]: https://github.com/China-xiaoFang/Fast.Utils/compare/v2.1.1...v2.1.2
[2.1.1]: https://github.com/China-xiaoFang/Fast.Utils/compare/v2.1.0...v2.1.1
[2.1.0]: https://github.com/China-xiaoFang/Fast.Utils/compare/v2.0.3...v2.1.0
[2.0.3]: https://github.com/China-xiaoFang/Fast.Utils/releases/tag/v2.0.3
[2.0.2]: https://github.com/China-xiaoFang/Fast.Utils/releases/tag/v2.0.2
[2.0.1]: https://github.com/China-xiaoFang/Fast.Utils/releases/tag/v2.0.1
[2.0.0]: https://github.com/China-xiaoFang/Fast.Utils/releases/tag/v2.0.0
