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

/**
 * 以可选能力视图读取全局对象。
 *
 * @remarks TypeScript 的 DOM 声明假定浏览器全局始终存在，但本包也会在 Node、WebView
 * 和 uni-app 中运行。这里只放宽能力是否存在，不改变标准 API 的属性与方法类型。
 */
export const runtimeGlobals = globalThis as RuntimeGlobals;
