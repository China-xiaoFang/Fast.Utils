import { reactive } from "vue";
import { isNil, isString } from "lodash-unified";
import { FastError } from "../error";

const state = reactive({
	/** @description Uni-App 在 APP-PLUS 下是否拆分输出 @default false */
	uniAppPlusSplit: false,
});

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types
export const useConsole = () => {
	return {
		/**
		 * 设置 Uni-App 在 APP-PLUS 下是否拆分输出
		 */
		setUniAppPlusSplit(value: boolean): void {
			state.uniAppPlusSplit = value;
		},
	};
};

type LogLevel = "log" | "warn" | "debug" | "error";

const vConsole = (level: LogLevel, ...args: any[]): void => {
	if (state.uniAppPlusSplit) {
		if (typeof uni !== "undefined") {
			if (typeof plus !== "undefined") {
				// 循环 arg 参数，每个参数单独输出
				args.forEach((item) => {
					if (isNil(item)) return;
					// eslint-disable-next-line no-console
					console[level](isString(item) ? item : JSON.stringify(item, null, 2));
				});
				return;
			}
		}
	}
	// eslint-disable-next-line no-console
	console[level](...args);
};

const makeConsole = (level: LogLevel) => {
	return (name: string, message?: string | false, error?: any): void => {
		const prefix = `[Fast-${level.toUpperCase()}-${name}]`;
		if (error) {
			vConsole(level, `${prefix}${message ?? ""}`, error);
		} else {
			vConsole(level, `${prefix}${message ?? ""}`);
		}
	};
};

/**
 * 打印 Log 日志
 * @param name 来源名称
 */
export const consoleLog = makeConsole("log");

/**
 * 打印 Warn 日志
 * @param name 来源名称
 */
export const consoleWarn = makeConsole("warn");

/**
 * 打印 Debug 日志
 * @param name 来源名称
 */
export const consoleDebug = makeConsole("debug");

/**
 * 打印 Error 日志
 * @param name 来源名称
 */
export const consoleError = (name: string, message?: any): void => {
	if (isNil(message)) {
		return;
	}
	if (isString(message)) {
		console.error(new FastError(`[Fast-${name}] ${message}`));
	} else {
		vConsole("error", `[Fast-Error-${name}]`, message);
	}
};

/**
 * 抛出错误
 * @param name 来源名称
 */
export const throwError = (name: string, message?: any): never => {
	throw new FastError(`[Fast-${name}] ${message}`);
};
