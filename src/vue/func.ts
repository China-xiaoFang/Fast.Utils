/**
 * 执行方法
 * @param fn 要执行的方法
 * @param args 参数
 */

import { consoleError } from "src/console";

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export const execFunction = async <T = void>(fn: Function, ...args: any[]): Promise<T> => {
	if (!fn) return Promise.resolve(undefined);
	// 判断是否为异步方法
	if (fn.constructor.name === "AsyncFunction") {
		// 异步方法
		try {
			return await fn(...args);
		} catch (error) {
			consoleError("execFunction", error as any);
			return Promise.reject(error);
		}
	} else {
		// 同步方法
		return new Promise((resolve, reject) => {
			try {
				const res = fn(...args);
				return resolve(res);
			} catch (error) {
				consoleError("execFunction", error as any);
				return reject(error);
			}
		});
	}
};
