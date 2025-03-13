const b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
const b64re = /^(?:[A-Za-z\d+/]{4})*?(?:[A-Za-z\d+/]{2}(?:==)?|[A-Za-z\d+/]{3}=?)?$/;

/**加密字典 */
const base64PwdDic = [
	{ index: 977, randomIndex: 188 },
	{ index: 926, randomIndex: 201 },
	{ index: 851, randomIndex: 225 },
	{ index: 700, randomIndex: 255 },
	{ index: 600, randomIndex: 268 },
	{ index: 500, randomIndex: 277 },
	{ index: 400, randomIndex: 288 },
	{ index: 330, randomIndex: 327 },
	{ index: 300, randomIndex: 180 },
	{ index: 200, randomIndex: 178 },
	{ index: 100, randomIndex: 124 },
	// 100 以内字典
	{ index: 98, randomIndex: 95 },
	{ index: 92, randomIndex: 90 },
	{ index: 91, randomIndex: 87 },
	{ index: 88, randomIndex: 84 },
	{ index: 82, randomIndex: 79 },
	{ index: 78, randomIndex: 71 },
	{ index: 72, randomIndex: 69 },
	{ index: 68, randomIndex: 66 },
	{ index: 59, randomIndex: 55 },
	{ index: 48, randomIndex: 43 },
	{ index: 42, randomIndex: 37 },
	{ index: 36, randomIndex: 30 },
	{ index: 33, randomIndex: 27 },
	{ index: 24, randomIndex: 20 },
	{ index: 23, randomIndex: 18 },
	{ index: 21, randomIndex: 16 },
	{ index: 17, randomIndex: 14 },
	{ index: 13, randomIndex: 9 },
	{ index: 7, randomIndex: 4 },
	{ index: 5, randomIndex: 3 },
	{ index: 2, randomIndex: 1 },
];

/**随机字符串长度 */
const randomPrefixStrLength = 6;

/**随机字符串 */
const randomStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

/**
 * 在Base64字符串中添加加密字典
 */
function insertRandomStrToBase64Str(base64Str: string): string {
	let strResult = base64Str;
	const items = base64PwdDic.sort((a, b) => {
		return b.index - a.index;
	});
	items.forEach((item) => {
		if (item.index < base64Str.length) {
			const randomChar = base64Str[item.randomIndex];
			strResult = strResult.slice(0, item.index) + randomChar + strResult.slice(item.index);
		}
	});
	return strResult;
}

/**
 * 删除Base64字符串中的加密字典
 */
function removeBase64StrRandomStr(base64Str: string): string {
	const items = base64PwdDic.sort((a, b) => {
		return a.index - b.index;
	});
	let strResult = base64Str;
	items.forEach((item) => {
		if (item.index < base64Str.length) {
			strResult = strResult.slice(0, item.index) + strResult.slice(item.index + 1);
		}
	});
	return strResult;
}

/**
 * 得到随机字符串
 */
function getRandomStr(str = randomStr, prefixStrLength = randomPrefixStrLength): string {
	let result = "";
	for (let i = 0; i < prefixStrLength; i++) {
		const randomInt = Math.ceil(Math.random() * (str.length - 1));
		const randomChar = str[randomInt];
		result += randomChar;
	}
	return result;
}

/**
 * Base64工具类
 */
export const base64Util = {
	/**
	 * 将字符串编码为Base64格式
	 */
	bota(string: string): string {
		string = String(string);
		let bitmap,
			a,
			b,
			c,
			result = "",
			i = 0,
			// eslint-disable-next-line prefer-const
			rest = string.length % 3;

		for (; i < string.length; ) {
			if ((a = string.charCodeAt(i++)) > 255 || (b = string.charCodeAt(i++)) > 255 || (c = string.charCodeAt(i++)) > 255)
				throw new TypeError(
					"Failed to execute 'btoa' on 'Window': The string to be encoded contains characters outside of the Latin1 range."
				);

			bitmap = (a << 16) | (b << 8) | c;
			result += b64.charAt((bitmap >> 18) & 63) + b64.charAt((bitmap >> 12) & 63) + b64.charAt((bitmap >> 6) & 63) + b64.charAt(bitmap & 63);
		}

		return rest ? result.slice(0, rest - 3) + "===".substring(rest) : result;
	},
	/**
	 * 将Base64编码的字符串解码回其原始格式。
	 */
	atob(string: string): string {
		string = String(string).replace(/[\t\n\f\r ]+/g, "");
		if (!b64re.test(string)) throw new TypeError("Failed to execute 'atob' on 'Window': The string to be decoded is not correctly encoded.");
		string += "==".slice(2 - (string.length & 3));
		let bitmap,
			result = "",
			r1,
			r2,
			i = 0;
		for (; i < string.length; ) {
			bitmap =
				(b64.indexOf(string.charAt(i++)) << 18) |
				(b64.indexOf(string.charAt(i++)) << 12) |
				((r1 = b64.indexOf(string.charAt(i++))) << 6) |
				(r2 = b64.indexOf(string.charAt(i++)));

			result +=
				r1 === 64
					? String.fromCharCode((bitmap >> 16) & 255)
					: r2 === 64
						? String.fromCharCode((bitmap >> 16) & 255, (bitmap >> 8) & 255)
						: String.fromCharCode((bitmap >> 16) & 255, (bitmap >> 8) & 255, bitmap & 255);
		}
		return result;
	},
	/**
	 * 字符串ToBase64
	 */
	toBase64(str: string, prefixStrLength = randomPrefixStrLength): string {
		if (str.length === 0) {
			return "";
		}
		const randomPrefixStr = getRandomStr();
		let base64 = base64Util.bota(encodeURIComponent(str));
		if (prefixStrLength !== 0) {
			base64 = insertRandomStrToBase64Str(base64);
		}
		return randomPrefixStr + base64;
	},

	/**
	 * Base64转字符串
	 */
	base64ToStr(str: string, prefixStrLength = randomPrefixStrLength): string {
		let result = str;
		if (str.length === 0) {
			return "";
		}
		let input = str.slice(prefixStrLength);
		if (prefixStrLength !== 0) {
			input = removeBase64StrRandomStr(input);
		}
		result = base64Util.atob(input);
		return decodeURIComponent(result);
	},
};
