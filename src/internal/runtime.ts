/** Web、Node、WebView 与 uni-app 宿主可能按需提供的运行时全局能力。 */
interface RuntimeGlobals {
	readonly Intl?: {
		readonly Segmenter?: typeof Intl.Segmenter;
	};
	readonly crypto?: Omit<Partial<Crypto>, "subtle"> & {
		readonly subtle?: Partial<SubtleCrypto>;
	};
	readonly document?: Partial<Document>;
	readonly importScripts?: unknown;
	readonly isSecureContext?: boolean;
	readonly localStorage?: Storage;
	readonly navigator?: Partial<Navigator>;
	readonly plus?: unknown;
	readonly process?: unknown;
	readonly ResizeObserver?: typeof ResizeObserver;
	readonly sessionStorage?: Storage;
	readonly uni?: unknown;
	readonly window?: Window;
}

declare const plus: unknown;
declare const uni: unknown;

/**
 * 以可选能力视图读取全局对象。
 *
 * @remarks TypeScript 的 DOM 声明假定浏览器全局始终存在，但本包也会在 Node、WebView
 * 和 uni-app 中运行。这里只放宽能力是否存在，不改变标准 API 的属性与方法类型。
 */
export const runtimeGlobals = globalThis as RuntimeGlobals;

/**
 * 延迟读取 HTML5+ 注入的 `plus` 运行时对象。
 *
 * @remarks HTML5+ 与 uni-app App 运行时不保证把 `plus` 标识符挂载到 `globalThis`。
 * 自由标识符不存在时，再回退到全局属性以兼容传统 WebView 与测试环境。
 * @returns 当前 HTML5+ 运行时对象；非 App-Plus 环境返回 `undefined`。
 */
export function getRuntimePlus(): unknown {
	return typeof plus === "undefined" ? runtimeGlobals.plus : plus;
}

/**
 * 延迟读取 uni-app 注入的 `uni` 运行时对象。
 *
 * @remarks uni-app 不保证把 `uni` 标识符挂载到 `globalThis`。自由标识符不存在时，
 * 再回退到全局属性，以兼容浏览器式宿主与测试环境。
 * @returns 当前 uni-app 运行时对象；非 uni-app 环境返回 `undefined`。
 */
export function getRuntimeUni(): unknown {
	return typeof uni === "undefined" ? runtimeGlobals.uni : uni;
}
