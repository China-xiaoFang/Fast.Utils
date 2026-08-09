# Fast.Utils API

Fast.Utils is a browser-first utility package targeting ES2022. Package managers use its ESM entry, while CDNs use the separately minified IIFE entry. Its application environments are modern browsers, WebViews, Vue 3, and uni-app.

## Imports

The package has one public root entry. Every utility, including the Vue helpers, is exposed as a named export.

```ts
import { chunk, configureStorage, installationIdentity, Local } from "@fast-china/utils";
```

Internal helpers are not public subpaths. Aggregate utility objects are not exported; import named functions so bundlers can remove unused code.

## Storage

`Local` and `Session` initialize lazily with the legacy-compatible `fast__` prefix, JSON codec, and `Date.now`. Calling `configureStorage` is optional unless the defaults must be overridden.

```ts
import { Local, Session } from "@fast-china/utils";

Local.set("profile", { name: "Ada" }, { ttlMs: 3_600_000 });
Session.set("draft", { step: 2 });
```

`Local` and `Session` provide `get`, `set`, `has`, `remove`, `removeByPrefix`, `keys`, `pruneExpired`, and namespace-scoped `clear`. Missing and expired values return `undefined`. Invalid TTL values, empty prefixes, malformed stored envelopes, unavailable platform storage, and conflicting repeated configuration throw errors. Native storage quota and privacy errors are propagated. Custom options must be configured before the first Storage operation.

For uni-app, the first Storage operation or an explicit `configureStorage` call detects the global `uni` object and uses its synchronous Storage API. uni-app has no separate session backend, so `Session` throws when called in this mode.

```ts
import { Local } from "@fast-china/utils";

Local.set("token", "value");
```

`configureStorage({ prefix: "admin:", crypto: true })` restores the old global prefix and Base64-obfuscation options. `crypto: true` and `base64StorageCodec` are reversible encoding rather than encryption and must not protect secrets. A custom `codec` may be supplied instead of `crypto`.

`encodeSecureBase64` and `decodeSecureBase64` preserve the legacy dictionary payload while using a Web Crypto random prefix. Given the same default six-character prefix, valid legacy payloads remain byte-for-byte compatible. The old dictionary references an unavailable character for Base64 lengths 101–124, so the current implementation inserts a one-character fallback that the legacy removal flow can decode. The old custom-length argument always generated six random characters; the current API correctly generates `prefixLength` characters. Custom lengths must match during encoding and decoding; `0` disables both the prefix and dictionary insertion. The format remains reversible encoding rather than encryption.

## Identity

`installationIdentity` is the global installation identifier facade. Call `configureInstallationIdentity` in the application entry before first use to override its `identity:installation-id` cache key. `getOrCreateInstallationId(installationId?)` loads, creates, or replaces its UUID v4 value in `Local` storage. Storage uses its defaults when no explicit configuration was supplied. UUID generation requires Web Crypto and never falls back to `Math.random()`.

```ts
import { configureInstallationIdentity, configureStorage, getOrCreateInstallationId, installationIdentity } from "@fast-china/utils";

configureStorage({ prefix: "app:" });
configureInstallationIdentity({ cacheKey: "account:installation-id" });
getOrCreateInstallationId();
installationIdentity.read();
installationIdentity.clear();
```

The identifier is an installation-scoped value, not a hardware identifier, authentication credential, secret, or anti-fraud signal.

## Logger

Logger scope belongs to each message rather than a mutable logger or child instance:

```ts
import { logger } from "@fast-china/utils";

logger.info("storage", "profile loaded", { userId: 1 });
logger.error("network", "request failed", error);
```

`createLogger` configures the minimum level, brand prefix, sink, and optional uni-app App-Plus split output. Scope must be a non-empty string without surrounding whitespace.

## Crypto

The TypeScript Crypto public API mirrors the public methods and algorithm casing of .NET `CryptoUtil`:

| Capability                        | Shared method names                                                                                                                  |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Secure random and byte comparison | `GenerateRandomBytes`, `FixedTimeEquals`                                                                                             |
| MD5, SHA-1, and SHA-2 digests     | `MD5Encrypt`, `SHA1Encrypt`, `SHA256Encrypt`, `SHA256Bytes`, `SHA384Encrypt`, `SHA384Bytes`, `SHA512Encrypt`, `SHA512Bytes`          |
| HMAC                              | `HMACSHA256Encrypt`, `HMACSHA384Encrypt`, `HMACSHA512Encrypt`                                                                        |
| Password derivation and hashing   | `PBKDF2SHA256`, `HashPasswordPBKDF2SHA256`, `VerifyPasswordPBKDF2SHA256`                                                             |
| HKDF                              | `HKDFSHA256`                                                                                                                         |
| AES                               | `AESEncrypt`, `AESDecrypt`, `AESEncryptAuthenticated`, `AESDecryptAuthenticated`, `AESEncryptWithPassword`, `AESDecryptWithPassword` |
| RSA                               | `GenerateRSAKeyPair`, `RSAEncryptOAEP`, `RSADecryptOAEP`, `RSASignPSS`, `RSAVerifyPSS`                                               |
| Elliptic curves                   | `GenerateECDSAKeyPair`, `ECDSASign`, `ECDSAVerify`, `GenerateECDHKeyPair`, `DeriveECDHSecret`, `DeriveECDHKeySHA256`                 |

The Base64 v1 payload produced by `AESEncryptAuthenticated`, the `FAST-AES-256-GCM-V2` password payload, PBKDF2 password hashes, and PKCS#8/SPKI PEM keys interoperate with .NET in both directions. MD5 and HMAC output lowercase hexadecimal; SHA-1/256/384/512 output uppercase hexadecimal, matching .NET.

Store passwords with `HashPasswordPBKDF2SHA256` and `VerifyPasswordPBKDF2SHA256`; the result is not decryptable. AES-GCM provides confidentiality and integrity, HMAC authenticates with a shared key, SHA-2 computes digests, and HKDF/PBKDF2 derive keys. MD5, SHA-1, AES-CBC, and AES-ECB do not provide modern password-storage or authenticated-encryption guarantees.

## Modules

- `array`: `chunk`, `removeNullishValues`, `unique`, `uniqueBy`, `groupBy`, `partition`, `difference`, `intersection`, `hasDuplicatesBy`, and `allEqualBy`.
- `async`: abort-aware `sleep`, timeout, retry, bounded concurrent mapping, debounce, and throttle primitives.
- `base64`: strict UTF-8 Base64/Base64URL byte and text functions plus the historical Latin-1 and dictionary-obfuscation functions.
- `color`: Hex parsing/formatting/mixing, explicit black/white mixing, luminance, and contrast helpers.
- `crypto`: secure randomness, digests, HMAC, PBKDF2, HKDF, AES, RSA-OAEP/PSS, ECDSA, and ECDH.
- `date`: date validation and arithmetic, day ranges, relative formatting, and the seven historical date helpers as named functions.
- `dom`: CSS unit and style serialization helpers.
- `env`: capability and user-agent detection. Detection does not expand the supported runtime contract.
- `logger`: isolated configurable loggers and the default `logger`.
- `number`: ranges, rounding, aggregation, interpolation, byte formatting, and secure integer generation.
- `object`: prototype-safe selection, comparison, mapping, and query serialization. Style serialization is provided by the `dom` module.
- `string`: query parsing, casing, grapheme-aware truncation, UUID, secure random strings, escaping, and whitespace normalization.
- `vue`: Composition API, type, render, and `app.use()` registration helpers for Vue 3.

## Security and limits

AES-GCM provides confidentiality and integrity; AES-CBC/ECB do not authenticate ciphertexts. MD5, SHA-1, and the historical Base64 dictionary must not protect passwords, signatures, or sensitive data. Cryptographic helpers enforce algorithm-specific parameter and payload limits and require Web Crypto where applicable.

Query and object helpers reject prototype-polluting keys. URL decoders are bounded. Storage cleanup is always restricted to the configured namespace. Browser globals are resolved only when an API is called, never during module import.

## Errors and compatibility

Programming errors, invalid inputs, unsupported platform capabilities, and malformed protected data throw native errors unless a function explicitly documents a nullable result.
