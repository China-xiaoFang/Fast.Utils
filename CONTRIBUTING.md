# Contributing to Fast.Utils

Thank you for improving Fast.Utils. Contributions should make behavior more predictable, types more truthful, or supported workflows easier to verify.

## Requirements

- Node.js `^22.18.0 || ^24.18.0`
- pnpm `^11.0.0` through Corepack
- Git with LF line endings

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm check
```

Use `pnpm dev` when a long-running tsdown watch build is useful during implementation.

## Design rules

- Prefer small named functions with explicit semantics over mutable utility singletons.
- Do not introduce global configuration, import-time platform access, or hidden logging.
- Keep the framework-neutral root independent from Vue.
- Do not add a production dependency when the platform or a small reviewed implementation is sufficient.
- Do not add ambiguous deep merge, string-path access, unbounded cache, or automatic retry behavior without a concrete contract and bounded risk.
- Treat serialized data, cryptographic formats, storage namespaces, package exports, runtime requirements, and peer ranges as public design decisions.
- Reject invalid input early. Do not silently return raw or partially parsed data after corruption.

## Public API checklist

Every new public function, type, interface, class, method, or option must include TSDoc covering the applicable items:

- purpose and non-obvious design rationale;
- type parameters, parameters, defaults, units, and accepted ranges;
- return value, ordering, mutation, allocation, and empty-input behavior;
- native error classes, `name`, `cause`, and failure semantics;
- cancellation, concurrency, cleanup, and ownership semantics;
- browser, Vue, or uni-app runtime restrictions;
- security boundaries and common misuse risks;
- a focused example when the signature alone is insufficient.

Comments should explain why a choice exists. Do not repeat obvious syntax or add comments only to increase volume.

## Tests

- Add a regression test for every defect.
- Test successful calls, invalid input, empty input, boundary values, and relevant cancellation or platform branches.
- Add compile-only cases to `tests/public-api.test.ts` for inference and rejected calls.
- Avoid tests that execute code without asserting meaningful behavior.
- Keep tests deterministic; inject clocks, storage, sinks, identifiers, and signals where supported.

Run the narrowest relevant command during development, then run the full set before opening a pull request:

```bash
pnpm typecheck
pnpm test
pnpm test:types
pnpm lint
pnpm format:check
pnpm build
pnpm test:package
```

## Dependencies

Development tools use reviewed caret ranges and are resolved exactly by `pnpm-lock.yaml`. Before changing a tool version:

1. verify Node.js and peer requirements;
2. review release notes and security advisories;
3. regenerate only the lock file with the pinned pnpm version;
4. run type, lint, test, build, package-consumer, audit, and dry-run checks;
5. avoid unrelated upgrades in the same pull request.

This repository intentionally defines its own ESLint Flat Config and must not depend on `@fast-china/eslint-config`.

## Pull requests

- Keep the diff focused and avoid repository-wide formatting unrelated to the change.
- Update English and Chinese docs for user-visible behavior.
- Add a dated `CHANGELOG.md` entry only when preparing a release.
- Describe API, runtime, package-entry, type, security, and size impact.
- Never include credentials, private endpoints, connection strings, or production data.
- Do not publish, tag, push, or deploy from a contribution workflow.

## Security reports

Do not open a public issue for a suspected vulnerability. Follow [SECURITY.md](./SECURITY.md).
