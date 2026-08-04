/** 可识别的主要 JavaScript 运行环境。 */
export type RuntimeKind = "browser" | "node" | "unknown" | "worker";

/** 环境检测需要逐项确认的 SubtleCrypto 最小能力集合。 */
type RuntimeSubtleCrypto = Partial<
	Pick<SubtleCrypto, "decrypt" | "deriveBits" | "deriveKey" | "digest" | "encrypt" | "exportKey" | "generateKey" | "importKey" | "sign" | "verify">
>;

/** 环境检测读取的 Web Crypto 最小视图。 */
interface RuntimeEnvironmentCrypto extends Partial<Pick<Crypto, "getRandomValues">> {
	/** 可选 SubtleCrypto 能力；只有所需方法全部存在时才视为完整 Web Crypto。 */
	subtle?: RuntimeSubtleCrypto;
}

/** 环境检测读取的最小 Navigator 视图。 */
interface RuntimeNavigator {
	/** 平台报告的最大同时触点数；类型异常时按 `0` 处理。 */
	maxTouchPoints?: unknown;
	/** 平台报告的 User-Agent；类型异常时按空字符串处理。 */
	userAgent?: unknown;
}

/** 环境检测读取的最小 Node 进程视图。 */
interface RuntimeProcess {
	/** 可选运行时版本表。 */
	versions?: RuntimeVersions;
}

/** 环境检测读取的最小运行时版本表。 */
interface RuntimeVersions {
	/** Node.js 版本文本；存在字符串值时识别为 Node 环境。 */
	node?: unknown;
}

/** 环境检测读取的最小 Window 视图。 */
interface RuntimeWindow {
	/** DOM 文档标记；只检查是否为非空对象。 */
	document?: unknown;
}

/** 可选平台全局对象的结构化视图，避免导入 Node 或 uni-app 全局类型。 */
interface RuntimeGlobals {
	/** 可选 Web Crypto 能力；所有方法都在调用前逐项检查，不因对象存在而假定完整实现。 */
	crypto?: RuntimeEnvironmentCrypto;
	/** Web Worker 中通常存在的脚本导入函数；只检查其类型，不会在检测阶段调用。 */
	importScripts?: unknown;
	/** 浏览器或 WebView 暴露的最小 Navigator 字段；未知类型会被能力读取函数视为缺失。 */
	navigator?: RuntimeNavigator;
	/** 工具或测试环境可能暴露的 Node 版本标记；仅用于检测，不代表 Node 属于应用运行时契约。 */
	process?: RuntimeProcess;
	/** uni-app 平台标记；Storage 会在调用 `configureStorage` 时读取并校验该全局对象。 */
	uni?: unknown;
	/** 浏览器 Window 的最小结构；`document` 只用于能力判定，不在模块导入阶段读取 DOM 内容。 */
	window?: RuntimeWindow | null;
}

const runtimeGlobals = globalThis as unknown as RuntimeGlobals;

/**
 * 延迟读取当前 User-Agent。
 *
 * @returns Navigator 不存在或字段类型异常时返回空字符串。
 */
const currentUserAgent = (): string => (typeof runtimeGlobals.navigator?.userAgent === "string" ? runtimeGlobals.navigator.userAgent : "");
/**
 * 延迟读取当前设备报告的最大触点数。
 *
 * @returns Navigator 不存在或字段类型异常时返回 `0`。
 */
const currentTouchPoints = (): number => (typeof runtimeGlobals.navigator?.maxTouchPoints === "number" ? runtimeGlobals.navigator.maxTouchPoints : 0);

/**
 * 判断当前运行时是否具有浏览器 `window` 与 `document`。
 *
 * @returns 两项能力均存在时返回 `true`；不读取 DOM 内容。
 */
export function isBrowser(): boolean {
	const window = runtimeGlobals.window;
	return window !== undefined && window !== null && window.document !== null && typeof window.document === "object";
}

/**
 * 判断当前运行时是否像 Web Worker 且不是 Window。
 *
 * @remarks 经典、模块、Shared 与 Service Worker 全局通常都暴露 `importScripts`；模块
 * Worker 中调用它可能抛错，本检测只检查能力存在，不会执行。
 * @returns 具有 `importScripts` 且不是浏览器 Window 时返回 `true`。
 */
export function isWebWorker(): boolean {
	return !isBrowser() && typeof runtimeGlobals.importScripts === "function";
}

/**
 * 判断当前运行时是否暴露 Node.js 版本标记。
 *
 * @returns `process.versions.node` 为字符串时返回 `true`。
 */
export function isNode(): boolean {
	return typeof runtimeGlobals.process?.versions?.node === "string";
}

/**
 * 判断当前运行时是否暴露 uni-app 的 `uni` 全局对象。
 *
 * @returns 全局属性存在且不为 `undefined` 时返回 `true`；不调用任何平台 API。
 */
export function isUniApp(): boolean {
	return runtimeGlobals.uni !== undefined;
}

/**
 * 判断当前运行时是否具备本库完整加密 API 所需的 Web Crypto 能力。
 *
 * @remarks 只具有 `getRandomValues` 的平台仍可调用随机数与随机字符串 API，但本函数
 * 会返回 `false`，因为摘要、PBKDF2、AES-GCM、RSA 与 ECC 还需要完整的 `SubtleCrypto` 方法集。
 * @returns 同时提供本库 Web Crypto 功能所需方法时返回 `true`。
 */
export function hasWebCrypto(): boolean {
	const crypto = runtimeGlobals.crypto;
	const subtle = crypto?.subtle;
	return (
		typeof crypto?.getRandomValues === "function" &&
		typeof subtle?.decrypt === "function" &&
		typeof subtle.deriveBits === "function" &&
		typeof subtle.deriveKey === "function" &&
		typeof subtle.digest === "function" &&
		typeof subtle.encrypt === "function" &&
		typeof subtle.exportKey === "function" &&
		typeof subtle.generateKey === "function" &&
		typeof subtle.importKey === "function" &&
		typeof subtle.sign === "function" &&
		typeof subtle.verify === "function"
	);
}

/**
 * 返回当前主要运行环境。
 *
 * @remarks 在使用 DOM 模拟器的 Node.js 进程中优先报告 `browser`，因为可观察能力比宿主进程名称更有用。
 * @returns `browser`、`worker`、`node` 或无法识别时的 `unknown`。
 */
export function detectRuntime(): RuntimeKind {
	if (isBrowser()) return "browser";
	if (isWebWorker()) return "worker";
	if (isNode()) return "node";
	return "unknown";
}

/**
 * 基于 User-Agent 启发式判断手机设备。
 *
 * @param userAgent - 默认读取当前 `navigator.userAgent`；平台对象不存在时使用空字符串。
 * @remarks User-Agent 可以被伪造，不得用于鉴权、安全策略或永久功能分流。
 * @returns 命中手机特征时返回 `true`。
 */
export function isMobileUserAgent(userAgent: string = currentUserAgent()): boolean {
	return /Mobile|iPhone|Android.*Mobile|Windows Phone/iu.test(userAgent);
}

/**
 * 基于 User-Agent 与触点数量启发式判断平板设备。
 *
 * @param userAgent - 默认读取当前 User-Agent。
 * @param maxTouchPoints - 用于识别桌面 User-Agent 模式下的 iPadOS，默认读取当前触点数。
 * @returns 命中平板特征时返回 `true`。
 */
export function isTabletUserAgent(userAgent: string = currentUserAgent(), maxTouchPoints: number = currentTouchPoints()): boolean {
	return /iPad|Android(?!.*Mobile)|Tablet/iu.test(userAgent) || (/Macintosh/iu.test(userAgent) && maxTouchPoints > 1);
}
