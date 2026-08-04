# Security Policy

## Supported releases

Security fixes are provided for the latest stable release. Pre-release builds and unsupported runtime combinations receive best-effort investigation only.

## Reporting a vulnerability

Use the repository's private GitHub Security Advisory reporting flow. Do not disclose the issue publicly until a fix and coordinated disclosure plan are available.

Include:

- affected package version and public API;
- runtime, browser, framework, and platform;
- minimal reproduction without real credentials or user data;
- expected and observed impact;
- whether untrusted input, authentication, storage, or cryptography is involved.

Maintainers should acknowledge a complete report within five business days. Timelines depend on severity, reproducibility, affected platforms, and release coordination.

## Security boundaries

Fast.Utils is a utility library, not a complete security system.

- `encryptText` provides authenticated encryption for caller-owned text up to 8 MiB of UTF-8 with a caller-owned password. It does not provide KMS, key rotation, account recovery, rate limiting, or protocol negotiation.
- `sha256` is a fast digest and must not be used directly for password storage.
- `timingSafeEqual` avoids explicit early exit, but JavaScript engines cannot guarantee strict constant-time execution.
- Base64 and Base64URL are encodings, not encryption.
- Web Storage is readable by same-origin script and must not contain passwords, private keys, or long-lived credentials.
- Installation IDs are local convenience identifiers, not authentication, hardware identity, or fraud signals.
- User-Agent detection is heuristic and must not drive authorization or trust decisions.
- `escapeHtml` is limited to HTML text context and is not a general sanitizer.
- `serializeStyle` converts trusted structures and does not sanitize untrusted CSS.
- Logger calls must not receive passwords, tokens, keys, connection strings, or complete personal data.

## Supply chain and release controls

- The runtime package allows only the reviewed `crypto-js` production dependency; package checks enforce this allowlist.
- Development dependencies are exact and locked.
- CI runs frozen installation, lint, strict type checks, tests, build, package consumers, and package inspection.
- The release gate validates package metadata, changelog/version consistency, build output, consumers, and the npm archive before publication.
- Release workflows use pinned action commits and do not persist checkout credentials.

## Handling secrets

No secret is required to build or test the repository. Never commit npm tokens, GitHub tokens, signing keys, private registry credentials, `.env` files, production logs, or encrypted data whose password is available in the same repository.
