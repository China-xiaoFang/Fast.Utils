# Fast.Utils API

Fast.Utils is a browser-first, pure ESM utility package targeting ES2022. Its application environments are modern browsers, WebViews, Vue 2.7/3, and uni-app.

## Imports

The package has one public root entry. Every utility, including the Vue helpers, is exposed as a named export.

```ts
import { chunk, configureStorage, installationIdentity, Local } from "@fast-china/utils";
```

Internal helpers are not public subpaths. Aggregate utility objects are not exported; import named functions so bundlers can remove unused code.

## Storage

Call `configureStorage` once in the application entry, then import `Local` or `Session` directly wherever needed.

```ts
import { configureStorage, Local, Session } from "@fast-china/utils";

configureStorage({ prefix: "admin:" });

Local.set("profile", { name: "Ada" }, { ttlMs: 3_600_000 });
Session.set("draft", { step: 2 });
```

`Local` and `Session` provide `get`, `set`, `has`, `remove`, `removeByPrefix`, `keys`, `pruneExpired`, and namespace-scoped `clear`. Missing and expired values return `undefined`. Invalid TTL values, empty prefixes, malformed stored envelopes, unavailable platform storage, and conflicting repeated configuration throw errors. Native storage quota and privacy errors are propagated.

For uni-app, `configureStorage` automatically detects the global `uni` object and uses its synchronous Storage API. uni-app has no separate session backend, so `Session` throws when called in this mode.

```ts
import { configureStorage, Local } from "@fast-china/utils";

configureStorage({ prefix: "mini:" });
Local.set("token", "value");
```

Custom codecs may be supplied with `codec`. `base64StorageCodec` is reversible obfuscation, not encryption.

`encodeSecureBase64` and `decodeSecureBase64` preserve the legacy dictionary payload while using a Web Crypto random prefix. Given the same default six-character prefix, valid legacy payloads remain byte-for-byte compatible. The old dictionary references an unavailable character for Base64 lengths 101–124, so the current implementation inserts a one-character fallback that the legacy removal flow can decode. The old custom-length argument always generated six random characters; the current API correctly generates `prefixLength` characters. Custom lengths must match during encoding and decoding; `0` disables both the prefix and dictionary insertion. The format remains reversible encoding rather than encryption.

## Identity

`installationIdentity` is the global installation identifier facade. Call `configureInstallationIdentity` in the application entry before first use to override its `identity:installation-id` cache key. `getOrCreateInstallationId(installationId?)` loads, creates, or replaces its UUID v4 value in configured `Local` storage. Call `configureStorage` first. UUID generation requires Web Crypto and never falls back to `Math.random()`.

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

## Modules

- `array`: `chunk`, `removeNullishValues`, `unique`, `uniqueBy`, `groupBy`, `partition`, `difference`, `intersection`, `hasDuplicatesBy`, and `allEqualBy`.
- `async`: abort-aware `sleep`, timeout, retry, bounded concurrent mapping, debounce, and throttle primitives.
- `base64`: strict UTF-8 Base64/Base64URL byte and text functions plus the historical Latin-1 and dictionary-obfuscation functions.
- `color`: Hex parsing/formatting/mixing, explicit black/white mixing, luminance, and contrast helpers.
- `crypto`: secure randomness, hashes, AES compatibility helpers, authenticated password encryption, RSA-OAEP, ECDSA, and ECDH helpers.
- `date`: date validation and arithmetic, day ranges, relative formatting, and the seven historical date helpers as named functions.
- `dom`: CSS unit and style serialization helpers.
- `env`: capability and user-agent detection. Detection does not expand the supported runtime contract.
- `logger`: isolated configurable loggers and the default `logger`.
- `number`: ranges, rounding, aggregation, interpolation, byte formatting, and secure integer generation.
- `object`: prototype-safe selection, comparison, mapping, and query serialization. Style serialization is provided by the `dom` module.
- `string`: query parsing, casing, grapheme-aware truncation, UUID, secure random strings, escaping, and whitespace normalization.
- `vue`: Composition API, type, render, and registration helpers for Vue 2.7/3. `makeSlots` is Vue 3-only because it uses Vue's official `SlotsType`.

## Security and limits

Use authenticated password encryption for new protected payloads. AES-CBC/ECB, MD5, SHA-1, and the historical Base64 dictionary exist for protocol compatibility and must not be presented as modern authenticated encryption. Cryptographic helpers enforce algorithm-specific parameter and payload limits and require Web Crypto where applicable.

Query and object helpers reject prototype-polluting keys. URL decoders are bounded. Storage cleanup is always restricted to the configured namespace. Browser globals are resolved only when an API is called, never during module import.

## Errors and compatibility

Programming errors, invalid inputs, unsupported platform capabilities, and malformed protected data throw native errors unless a function explicitly documents a nullable result.
