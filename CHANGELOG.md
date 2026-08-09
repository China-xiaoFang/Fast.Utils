# Changelog

All notable changes to Fast.Utils are documented in this file.

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

[2.0.1]: https://github.com/China-xiaoFang/Fast.Utils/releases/tag/v2.0.1
[2.0.0]: https://github.com/China-xiaoFang/Fast.Utils/releases/tag/v2.0.0
