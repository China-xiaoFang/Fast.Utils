import { computed, reactive } from "vue";
import { base64Util } from "../base64";
import { consoleError } from "../console";
import { FastError } from "../error";

const state = reactive({
	prefix: "fast__",
	expireSuffix: "__Expire",
	crypto: false,
});

/**
 * 本地缓存前缀 Key
 */
export const CACHE_PREFIX = computed(() => state.prefix);

/**
 * 本地缓存过期值后缀 Key
 */
export const CACHE_EXPIRE_SUFFIX = computed(() => state.expireSuffix);

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types
export const useStorage = () => {
	return {
		/**
		 * 设置缓存前缀 Key
		 * @param key
		 */
		prefix(key: string): void {
			state.prefix = key;
		},
		/**
		 * 缓存过期值后缀 Key
		 * @param key
		 */
		expireSuffix(key: string): void {
			state.expireSuffix = key;
		},
		/**
		 * 设置缓存是否加密
		 * @param crypto
		 */
		crypto(crypto: boolean): void {
			state.crypto = crypto;
		},
	};
};

const storage = {
	set(key: string, val: any): void {
		if (typeof uni !== "undefined") {
			uni.setStorageSync(key, val);
		} else {
			window.localStorage.setItem(key, val);
		}
	},
	get(key: string): string | any | null {
		if (typeof uni !== "undefined") {
			return uni.getStorageSync(key);
		} else {
			return window.localStorage.getItem(key);
		}
	},
	remove(key: string): void {
		if (typeof uni !== "undefined") {
			uni.removeStorageSync(key);
		} else {
			window.localStorage.removeItem(key);
		}
	},
	clear(): void {
		if (typeof uni !== "undefined") {
			uni.clearStorageSync();
		} else {
			window.localStorage.clear();
		}
	},
	keys(): string[] | Storage {
		if (typeof uni !== "undefined") {
			return uni.getStorageInfoSync().keys;
		} else {
			return window.localStorage;
		}
	},
};

/**
 * window.localStorage
 * - 如果是 UniApp 环境则使用的是 uni.xxxStorage
 */
export const Local = {
	/**
	 * 设置
	 * @param key 缓存的Key
	 * @param val 缓存值
	 * @param expire 过期时间，单位分钟
	 * @param encrypt 是否对缓存的数据加密
	 */
	set(key: string, val: any, expire?: number, encrypt?: boolean): void {
		try {
			encrypt ??= state.crypto;
			// 判断是否存在缓存过期时间
			if (expire) {
				if (isNaN(expire) || expire < 1) {
					throw new FastError("有效期应为一个有效数值");
				}
				// 设置过期时间的缓存
				const expireData = {
					time: Date.now(),
					expire,
				};
				const expireJson = JSON.stringify(expireData);
				storage.set(`${state.prefix}${key}${state.expireSuffix}`, expireJson);
			}
			let valJson = JSON.stringify(val);
			if (encrypt) {
				valJson = base64Util.toBase64(valJson);
			}
			storage.set(`${state.prefix}${key}`, valJson);
		} catch (error) {
			consoleError("Local", error);
		}
	},
	/**
	 * 获取
	 * @param key 缓存的Key
	 * @param decrypt 是否对缓存的数据解密
	 * @returns {T} 传入的对象类型，默认为 string
	 */
	get<T = string>(key: string, decrypt?: boolean): T {
		try {
			decrypt ??= state.crypto;
			// 获取缓存 JSON 字符串
			let valJson = storage.get(`${state.prefix}${key}`);

			if (valJson) {
				// 判断是否解密
				if (decrypt) {
					valJson = base64Util.base64ToStr(valJson);
				}
				// 尝试获取缓存过期时间的 JSON 字符串
				const expireJson = storage.get(`${state.prefix}${key}${state.expireSuffix}`);
				// 判断是否存在过期时间
				if (expireJson) {
					const expireData = JSON.parse(expireJson);
					if (Date.now() > expireData.time + expireData.expire * 60 * 1000) {
						// 过期了，删除对应的缓存数据
						storage.remove(`${state.prefix}${key}`);
						storage.remove(`${state.prefix}${key}${state.expireSuffix}`);
						return null;
					}
				}
				try {
					return JSON.parse(valJson) as T;
				} catch {
					return valJson as T;
				}
			}
			return null;
		} catch (error) {
			consoleError("Local", error);
		}
	},
	/**
	 * 移除
	 * @param key 缓存的Key
	 */
	remove(key: string): void {
		try {
			storage.remove(`${state.prefix}${key}`);
			storage.remove(`${state.prefix}${key}${state.expireSuffix}`);
		} catch (error) {
			consoleError("Local", error);
		}
	},
	/**
	 * 根据前缀移除
	 * @param key 缓存的Key
	 */
	removeByPrefix(key: string): void {
		try {
			for (const itemKey in storage.keys) {
				if (itemKey.indexOf(`${state.prefix}${key}`) !== -1) {
					storage.remove(itemKey);
				}
			}
		} catch (error) {
			consoleError("Local", error);
		}
	},
	/**
	 * 移除全部
	 */
	clear(): void {
		try {
			storage.clear();
		} catch (error) {
			consoleError("Local", error);
		}
	},
};

/**
 * window.sessionStorage
 * - UniApp 环境下不可用
 */
export const Session = {
	/**
	 * 设置会话缓存
	 * @param key 缓存的Key
	 * @param val 缓存值
	 * @param expire 过期时间，单位分钟
	 * @param encrypt 是否对缓存的数据加密
	 */
	set(key: string, val: any, expire?: number, encrypt?: boolean): void {
		if (typeof uni !== "undefined") {
			consoleError("Session", "UniApp 环境下 [Session] 不可用。");
			return;
		}
		try {
			encrypt ??= state.crypto;
			// 判断是否存在缓存过期时间
			if (expire) {
				if (isNaN(expire) || expire < 1) {
					throw new FastError("有效期应为一个有效数值");
				}
				// 设置过期时间的缓存
				const expireData = {
					time: Date.now(),
					expire,
				};
				const expireJson = JSON.stringify(expireData);
				window.sessionStorage.setItem(`${state.prefix}${key}${state.expireSuffix}`, expireJson);
			}
			let valJson = JSON.stringify(val);
			if (encrypt) {
				valJson = base64Util.toBase64(valJson);
			}
			window.sessionStorage.setItem(`${state.prefix}${key}`, valJson);
		} catch (error) {
			consoleError("Session", error);
		}
	},
	/**
	 * 获取会话缓存
	 * @param key 缓存的Key
	 * @param decrypt 是否对缓存的数据解密
	 * @returns {T} 传入的对象类型，默认为 string
	 */
	get<T = string>(key: string, decrypt?: boolean): T {
		if (typeof uni !== "undefined") {
			consoleError("Session", "UniApp 环境下 [Session] 不可用。");
			return;
		}
		try {
			decrypt ??= state.crypto;
			// 获取缓存 JSON 字符串
			let valJson = window.sessionStorage.getItem(`${state.prefix}${key}`);
			if (valJson) {
				// 判断是否解密
				if (decrypt) {
					valJson = base64Util.base64ToStr(valJson);
				}
				// 尝试获取缓存过期时间的 JSON 字符串
				const expireJson = window.sessionStorage.getItem(`${state.prefix}${key}${state.expireSuffix}`);
				// 判断是否存在过期时间
				if (expireJson) {
					const expireData = JSON.parse(expireJson);
					if (Date.now() > expireData.time + expireData.expire * 60 * 1000) {
						// 过期了，删除对应的缓存数据
						window.sessionStorage.removeItem(`${state.prefix}${key}`);
						window.sessionStorage.removeItem(`${state.prefix}${key}${state.expireSuffix}`);
						return null;
					}
				}
				try {
					return JSON.parse(valJson) as T;
				} catch {
					return valJson as T;
				}
			}
			return null;
		} catch (error) {
			consoleError("Session", error);
		}
	},
	/**
	 * 移除会话缓存
	 * @param key 缓存的Key
	 */
	remove(key: string): void {
		if (typeof uni !== "undefined") {
			consoleError("Session", "UniApp 环境下 [Session] 不可用。");
			return;
		}
		try {
			window.sessionStorage.removeItem(`${state.prefix}${key}`);
			window.sessionStorage.removeItem(`${state.prefix}${key}${state.expireSuffix}`);
		} catch (error) {
			consoleError("Session", error);
		}
	},
	/**
	 * 根据前缀移除会话缓存
	 * @param key 缓存的Key
	 */
	removeByPrefix(key: string): void {
		if (typeof uni !== "undefined") {
			consoleError("Session", "UniApp 环境下 [Session] 不可用。");
			return;
		}
		try {
			for (const itemKey in window.sessionStorage) {
				if (itemKey.indexOf(`${state.prefix}${key}`) !== -1) {
					window.sessionStorage.removeItem(itemKey);
				}
			}
		} catch (error) {
			consoleError("Session", error);
		}
	},
	/**
	 * 移除全部会话缓存
	 */
	clear(): void {
		if (typeof uni !== "undefined") {
			consoleError("Session", "UniApp 环境下 [Session] 不可用。");
			return;
		}
		try {
			window.sessionStorage.clear();
		} catch (error) {
			consoleError("Session", error);
		}
	},
};
