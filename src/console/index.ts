import { isNil, isString } from "lodash-unified";
import { FastError } from "../error";

/**
 * 打印 Log 日志
 * @param name 来源名称
 */
export const consoleLog = (name: string, message?: string | false, error?: any): void => {
	if (error) {
		// eslint-disable-next-line no-console
		console.log(`[Fast-Log-${name}]${message ? ` ${message}` : ""}`, error);
	} else {
		// eslint-disable-next-line no-console
		console.log(`[Fast-Log-${name}]${message ? ` ${message}` : ""}`);
	}
};

/**
 * 打印 Warn 日志
 * @param name 来源名称
 */
export const consoleWarn = (name: string, message?: string | false, error?: any): void => {
	if (error) {
		// eslint-disable-next-line no-console
		console.warn(`[Fast-Log-${name}]${message ? ` ${message}` : ""}`, error);
	} else {
		// eslint-disable-next-line no-console
		console.warn(`[Fast-Log-${name}]${message ? ` ${message}` : ""}`);
	}
};

/**
 * 打印 Debug 日志
 * @param name 来源名称
 */
export const consoleDebug = (name: string, message?: string | false, error?: any): void => {
	if (error) {
		// eslint-disable-next-line no-console
		console.debug(`[Fast-Log-${name}]${message ? ` ${message}` : ""}`, error);
	} else {
		// eslint-disable-next-line no-console
		console.debug(`[Fast-Log-${name}]${message ? ` ${message}` : ""}`);
	}
};

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
		// eslint-disable-next-line no-console
		console.error(`[Fast-Error-${name}]`, message);
	}
};

/**
 * 抛出错误
 * @param name 来源名称
 */
export const throwError = (name: string, message?: any): never => {
	throw new FastError(`[Fast-${name}] ${message}`);
};
