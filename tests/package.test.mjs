import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { Rolldown } from "tsdown";

const workspaceRoot = path.resolve(import.meta.dirname, "..");
const distRoot = path.join(workspaceRoot, "dist");
const packageJsonPath = path.join(workspaceRoot, "package.json");
const publicExportKeys = ["."];

/** 读取根 package.json，并拒绝数组、null 等非清单对象。 */
const readPackageManifest = () => {
	const value = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
	if (typeof value !== "object" || value === null || Array.isArray(value)) throw new TypeError("package.json must contain an object.");
	return value;
};

/** 把包内相对路径解析到仓库根目录，并阻止测试意外访问工作区之外。 */
const resolveWorkspacePath = (relativePath) => {
	const absolutePath = path.resolve(workspaceRoot, ...relativePath.split("/"));
	if (absolutePath !== workspaceRoot && !absolutePath.startsWith(`${workspaceRoot}${path.sep}`)) {
		throw new Error(`Path escapes the workspace: ${relativePath}`);
	}
	return absolutePath;
};

const consumerPath = path.join(workspaceRoot, "__package-consumer__.mjs");

const run = (command, arguments_) => {
	const result = spawnSync(command, arguments_, { cwd: workspaceRoot, encoding: "utf8" });
	if (result.error !== undefined) throw result.error;
	if (result.status !== 0) throw new Error(result.stderr || result.stdout || `Command failed: ${command} (${result.signal ?? result.status})`);
	return result.stdout;
};

const collectFiles = (directory) => {
	const result = [];
	for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
		const absolutePath = path.join(directory, entry.name);
		if (entry.isDirectory()) result.push(...collectFiles(absolutePath));
		else if (entry.isFile()) result.push(absolutePath);
	}
	return result;
};

const verifyBuildArtifacts = () => {
	if (!fs.existsSync(distRoot) || !fs.statSync(distRoot).isDirectory()) throw new Error("tsdown did not create dist/.");
	const manifest = readPackageManifest();
	const exportsMap = manifest["exports"];
	assert.ok(exportsMap !== null && typeof exportsMap === "object" && !Array.isArray(exportsMap));
	assert.deepEqual(Object.keys(exportsMap), publicExportKeys, "package.json must expose only the root entry.");

	const sourceRoot = path.join(workspaceRoot, "src");
	const sourceModulePaths = collectFiles(sourceRoot)
		.filter((filePath) => filePath.endsWith(".ts"))
		.map((filePath) => path.relative(sourceRoot, filePath).replaceAll(path.sep, "/").replace(/\.ts$/u, ""))
		.sort();
	const files = collectFiles(distRoot);
	const artifacts = files.map((filePath) => path.relative(workspaceRoot, filePath).replaceAll(path.sep, "/")).sort();
	assert.ok(artifacts.includes("dist/index.mjs"), "root JavaScript entry is missing.");
	assert.ok(artifacts.includes("dist/index.d.mts"), "root declaration entry is missing.");
	for (const artifact of artifacts) {
		assert.match(artifact, /\.(?:d\.mts|d\.mts\.map|mjs|mjs\.map)$/u, `unexpected build artifact: ${artifact}`);
		const sourcePath = artifact.replace(/^dist\//u, "").replace(/\.(?:d\.mts|mjs)(?:\.map)?$/u, "");
		assert.ok(sourceModulePaths.includes(sourcePath), `stale build artifact has no source module: ${artifact}`);
	}
	const totalBytes = files.reduce((total, filePath) => total + fs.statSync(filePath).size, 0);
	assert.ok(totalBytes <= 750_000, `dist exceeds the 750 KiB budget (${totalBytes} bytes)`);
};

const verifyRelativeImports = () => {
	const importPattern = /(?:\bfrom\s*["']|\bimport\s*\(\s*["'])(\.{1,2}\/[^"']+)["']/gu;
	for (const absolutePath of collectFiles(distRoot)) {
		if (!/\.(?:d\.mts|mjs)$/u.test(absolutePath)) continue;
		const source = fs.readFileSync(absolutePath, "utf8");
		for (const match of source.matchAll(importPattern)) {
			const specifier = match[1];
			if (specifier === undefined) continue;
			const dependency = path.resolve(path.dirname(absolutePath), specifier);
			if (!dependency.startsWith(`${distRoot}${path.sep}`) || !fs.existsSync(dependency) || !fs.statSync(dependency).isFile()) {
				throw new Error(`${path.relative(workspaceRoot, absolutePath)} imports missing file ${specifier}.`);
			}
		}
	}
};

/** 验证 Source Map 仅引用随包发布的第一方源码，并返回对应文件清单。 */
const verifySourceMaps = () => {
	const referencedSources = new Set();
	const sourceRoot = path.join(workspaceRoot, "src");
	for (const absolutePath of collectFiles(distRoot)) {
		if (!absolutePath.endsWith(".map")) continue;
		const sourceMap = JSON.parse(fs.readFileSync(absolutePath, "utf8"));
		assert.ok(sourceMap !== null && typeof sourceMap === "object" && !Array.isArray(sourceMap));
		const record = sourceMap;
		assert.ok(Array.isArray(record.sources) && record.sources.length > 0, `${path.relative(workspaceRoot, absolutePath)} has no sources.`);
		assert.ok(record.sourceRoot === undefined || typeof record.sourceRoot === "string");
		for (const source of record.sources) {
			assert.equal(typeof source, "string");
			const referencedPath = path.resolve(path.dirname(absolutePath), record.sourceRoot ?? "", source);
			assert.ok(
				referencedPath.startsWith(`${sourceRoot}${path.sep}`),
				`${path.relative(workspaceRoot, absolutePath)} references a source outside src: ${source}`
			);
			assert.ok(fs.existsSync(referencedPath) && fs.statSync(referencedPath).isFile());
			referencedSources.add(path.relative(workspaceRoot, referencedPath).replaceAll(path.sep, "/"));
		}
	}
	return referencedSources;
};

if (fs.existsSync(consumerPath)) throw new Error(`Refusing to overwrite existing fixture: ${consumerPath}`);

try {
	verifyBuildArtifacts();
	verifyRelativeImports();
	const sourceMapSources = verifySourceMaps();
	fs.writeFileSync(
		consumerPath,
		[
			'import { chunk, configureStorage, decodeBase64, encodeBase64, Local, Session, toQueryString } from "@fast-china/utils";',
			'import { useEmits } from "@fast-china/utils";',
			'if (JSON.stringify(chunk([1, 2, 3], 2)) !== "[[1,2],[3]]") throw new Error("Root array export failed.");',
			'if (decodeBase64(encodeBase64("Fast 工具库")) !== "Fast 工具库") throw new Error("Base64 round trip failed.");',
			'if (toQueryString({ id: [1, 2] }) !== "id=1&id=2") throw new Error("Query serialization failed.");',
			"class MemoryStorage { /** @type {Map<string, string>} */ #values = new Map(); get length() { return this.#values.size; } clear() { this.#values.clear(); } getItem(/** @type {string} */ key) { return this.#values.get(key) ?? null; } key(/** @type {number} */ index) { return [...this.#values.keys()][index] ?? null; } removeItem(/** @type {string} */ key) { this.#values.delete(key); } setItem(/** @type {string} */ key, /** @type {string} */ value) { this.#values.set(key, String(value)); } }",
			"globalThis.localStorage = new MemoryStorage(); globalThis.sessionStorage = new MemoryStorage();",
			'configureStorage({ prefix: "consumer:" }); Local.set("local", 1); Session.set("session", 2);',
			'if (Local.get("local") !== 1 || Session.get("session") !== 2) throw new Error("Storage facade failed.");',
			'const handlers = useEmits({ clear: null }, (eventName, ..._arguments) => { if (eventName !== "clear") throw new Error("Vue emit mapping failed."); });',
			"handlers.value.onClear?.();",
		].join("\n"),
		"utf8"
	);

	const typeScriptPath = path.join(workspaceRoot, "node_modules", "typescript", "bin", "tsc");
	run(process.execPath, [
		typeScriptPath,
		// TypeScript 6 no longer silently ignores a nearby tsconfig when explicit files are supplied.
		"--ignoreConfig",
		"--allowJs",
		"--checkJs",
		"--module",
		"NodeNext",
		"--moduleResolution",
		"NodeNext",
		"--target",
		"ES2022",
		"--strict",
		"--noEmit",
		"--skipLibCheck",
		"false",
		consumerPath,
	]);
	run(process.execPath, [consumerPath]);
	run(process.execPath, [
		"--input-type=module",
		"--eval",
		'delete globalThis.crypto; delete globalThis.Intl; delete globalThis.TextEncoder; delete globalThis.TextDecoder; await import("@fast-china/utils");',
	]);

	fs.writeFileSync(consumerPath, 'import { chunk } from "@fast-china/utils"; console.log(chunk([1, 2, 3], 2));\n', "utf8");
	const bundle = await Rolldown.rolldown({ input: consumerPath, treeshake: true });
	const generated = await bundle.generate({ format: "esm" });
	await bundle.close();
	const code = generated.output
		.filter((item) => item.type === "chunk")
		.map((item) => item.code)
		.join("\n");
	assert.ok(Buffer.byteLength(code) < 4_000, "A chunk-only consumer unexpectedly exceeded 4 KiB before minification.");
	assert.doesNotMatch(code, /AES-GCM|PBKDF2|createLogger|from\s*["']vue["']/u, "Unrelated crypto, logging, or Vue code leaked into the bundle.");

	const manifest = readPackageManifest();
	assert.deepEqual(manifest["dependencies"], { "crypto-js": "^4.2.0" }, "Published runtime dependencies must match the reviewed allowlist.");
	assert.deepEqual(manifest["peerDependencies"], { vue: "^2.7.0 || ^3.3.0" }, "Published peer dependencies must match the reviewed range.");
	assert.deepEqual(manifest["peerDependenciesMeta"], { vue: { optional: true } }, "Vue must remain an optional peer dependency.");
	const exportsMap = manifest["exports"];
	assert.ok(exportsMap !== null && typeof exportsMap === "object");
	for (const value of Object.values(exportsMap)) {
		if (typeof value === "string") {
			assert.ok(fs.existsSync(resolveWorkspacePath(value.slice(2))));
			continue;
		}
		assert.ok(value !== null && typeof value === "object");
		for (const target of Object.values(value)) {
			assert.equal(typeof target, "string");
			assert.ok(fs.existsSync(resolveWorkspacePath(target.slice(2))));
		}
	}

	const npmArguments = ["pack", "--dry-run", "--ignore-scripts", "--json"];
	const npmCliPath = path.join(path.dirname(process.execPath), "node_modules", "npm", "bin", "npm-cli.js");
	const npmCommand = process.platform === "win32" ? process.execPath : "npm";
	const npmCommandArguments = process.platform === "win32" ? [npmCliPath, ...npmArguments] : npmArguments;
	if (process.platform === "win32" && !fs.existsSync(npmCliPath)) throw new Error(`npm CLI was not found next to Node.js: ${npmCliPath}`);
	const npmResult = spawnSync(npmCommand, npmCommandArguments, {
		cwd: workspaceRoot,
		encoding: "utf8",
		env: { ...process.env, npm_config_cache: path.join(os.tmpdir(), "fast-utils-npm-cache") },
	});
	if (npmResult.error !== undefined) throw npmResult.error;
	if (npmResult.status !== 0) {
		throw new Error(npmResult.stderr || npmResult.stdout || `npm pack --dry-run failed (${npmResult.signal ?? npmResult.status}).`);
	}
	const packReport = JSON.parse(npmResult.stdout);
	assert.ok(Array.isArray(packReport) && packReport.length === 1);
	const report = packReport[0];
	const packedFiles = report.files?.map((file) => file.path ?? "") ?? [];
	const packageSize = report.size ?? report.packageSize ?? Number.POSITIVE_INFINITY;
	const unpackedSize = report.unpackedSize ?? Number.POSITIVE_INFINITY;
	assert.ok(packedFiles.includes("dist/index.mjs"));
	assert.ok(packedFiles.includes("dist/index.d.mts"));
	assert.ok(packedFiles.includes("src/index.ts"));
	assert.ok(packedFiles.every((file) => !/^(?:@fast-china|tests)\//u.test(file)));
	assert.ok(
		packedFiles.filter((file) => file.startsWith("src/")).every((file) => file.endsWith(".ts")),
		"Published source must contain TypeScript files only."
	);
	for (const referencedSource of sourceMapSources) {
		assert.ok(packedFiles.includes(referencedSource), `Source Map dependency is missing from the package: ${referencedSource}`);
	}
	assert.ok(!packedFiles.includes("Fast.png"));
	assert.ok(packageSize < 250_000, "Tarball exceeds the 250 KiB budget.");
	assert.ok(unpackedSize < 750_000, "Unpacked package exceeds the 750 KiB budget.");
} finally {
	if (fs.existsSync(consumerPath)) fs.unlinkSync(consumerPath);
}
