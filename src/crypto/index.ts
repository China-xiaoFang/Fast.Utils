import { AES, MD5, SHA1, enc, mode } from "crypto-js";
import { consoleError } from "../console";

/**
 * 加密解密
 */
export const cryptoUtil = {
	/**
	 * AES
	 */
	aes: {
		/**
		 * AES加密
		 * @param dataStr 要加密的字符串
		 * @param key 用于加密的密钥
		 * @param vector 用于加密的向量（IV）
		 * @param cipherMode 加密模式，默认为CBC模式
		 */
		encrypt(dataStr: string, key: string, vector: string, cipherMode: any = mode.CBC): string {
			if (!dataStr) {
				return dataStr;
			}

			// 处理Key不足32位的问题
			if (key.length < 32) {
				// 不足
				key = key.padEnd(32, "f");
			}

			// 处理Key超过32位的问题
			if (key.length > 32) {
				// 超过
				key = key.substring(0, 32);
			}

			// 处理IV不足16位的问题
			if (vector.length < 16) {
				// 不足
				vector = vector.padEnd(16, "f");
			}

			// 处理IV超过16位的问题
			if (vector.length > 16) {
				// 超过
				vector = vector.substring(0, 16);
			}

			return AES.encrypt(dataStr, enc.Utf8.parse(key), {
				iv: enc.Utf8.parse(vector),
				mode: cipherMode,
			}).toString();
		},
		/**
		 * AES解密
		 * @param dataStr 要解密的Base64编码字符串
		 * @param key 用于解密的密钥
		 * @param vector 用于解密的向量（IV）
		 * @param cipherMode 解密模式，默认为CBC模式
		 */
		decrypt<T = string>(dataStr: string, key: string, vector: string, cipherMode: any = mode.CBC): T | null {
			if (!dataStr) {
				return null;
			}

			// 处理Key不足32位的问题
			if (key.length < 32) {
				// 不足
				key = key.padEnd(32, "f");
			}

			// 处理Key超过32位的问题
			if (key.length > 32) {
				// 超过
				key = key.substring(0, 32);
			}

			// 处理IV不足16位的问题
			if (vector.length < 16) {
				// 不足
				vector = vector.padEnd(16, "f");
			}

			// 处理IV超过16位的问题
			if (vector.length > 16) {
				// 超过
				vector = vector.substring(0, 16);
			}

			const resAESData = AES.decrypt(dataStr, enc.Utf8.parse(key), {
				iv: enc.Utf8.parse(vector),
				mode: cipherMode,
			});
			try {
				const result = resAESData.toString(enc.Utf8);
				return JSON.parse(result) as T;
			} catch (error) {
				consoleError("AESCrypto", error);
				return null;
			}
		},
	},
	/**
	 * SHA1
	 */
	sha1: {
		/**
		 * SHA1加密
		 * @param dataStr 要加密的字符串
		 */
		encrypt(dataStr: string): string {
			if (!dataStr) {
				return dataStr;
			}

			return SHA1(dataStr).toString(enc.Hex).toUpperCase();
		},
	},
	/**
	 * MD5
	 */
	MD5: {
		/**
		 * MD5加密
		 * @param dataStr 要加密的字符串
		 */
		encrypt(dataStr: string): string {
			if (!dataStr) {
				return dataStr;
			}

			return MD5(dataStr).toString(enc.Hex).toUpperCase();
		},
	},
};
