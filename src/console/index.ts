import { isNil, isString } from "lodash-unified";
import { FastError } from "../error";

/**
 * 打印 Log 日志
 * @param name 来源名称
 */
export const consoleLog = (name: string, message?: string | false, error?: any): void => {
	if (error) {
		if (typeof uni !== "undefined") {
			if (typeof plus !== "undefined") {
				// eslint-disable-next-line no-console
				console.log(`[Fast-Log-${name}]${message ? ` ${message}` : ""}`);
				// eslint-disable-next-line no-console
				console.log(isString(error) ? error : JSON.stringify(error, null, 2));
			} else {
				// eslint-disable-next-line no-console
				console.log(`[Fast-Log-${name}]${message ? ` ${message}` : ""}`, error);
			}
		} else {
			// eslint-disable-next-line no-console
			console.log(`[Fast-Log-${name}]${message ? ` ${message}` : ""}`, error);
		}
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
		if (typeof uni !== "undefined") {
			if (typeof plus !== "undefined") {
				console.warn(`[Fast-Log-${name}]${message ? ` ${message}` : ""}`);
				console.warn(isString(error) ? error : JSON.stringify(error, null, 2));
			} else {
				console.warn(`[Fast-Log-${name}]${message ? ` ${message}` : ""}`, error);
			}
		} else {
			console.warn(`[Fast-Log-${name}]${message ? ` ${message}` : ""}`, error);
		}
	} else {
		console.warn(`[Fast-Log-${name}]${message ? ` ${message}` : ""}`);
	}
};

/**
 * 打印 Debug 日志
 * @param name 来源名称
 */
export const consoleDebug = (name: string, message?: string | false, error?: any): void => {
	if (error) {
		if (typeof uni !== "undefined") {
			if (typeof plus !== "undefined") {
				// eslint-disable-next-line no-console
				console.debug(`[Fast-Log-${name}]${message ? ` ${message}` : ""}`);
				// eslint-disable-next-line no-console
				console.debug(isString(error) ? error : JSON.stringify(error, null, 2));
			} else {
				// eslint-disable-next-line no-console
				console.debug(`[Fast-Log-${name}]${message ? ` ${message}` : ""}`, error);
			}
		} else {
			// eslint-disable-next-line no-console
			console.debug(`[Fast-Log-${name}]${message ? ` ${message}` : ""}`, error);
		}
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
		if (typeof uni !== "undefined") {
			if (typeof plus !== "undefined") {
				console.error(`[Fast-Error-${name}]`);
				console.error(JSON.stringify(message, null, 2));
			} else {
				console.error(`[Fast-Error-${name}]`, message);
			}
		} else {
			console.error(`[Fast-Error-${name}]`, message);
		}
	}
};

/**
 * 抛出错误
 * @param name 来源名称
 */
export const throwError = (name: string, message?: any): never => {
	throw new FastError(`[Fast-${name}] ${message}`);
};
