import { isString } from "lodash-unified";

/**
 * 字符串工具类
 */
export const stringUtil = {
	/**
	 * 获取Url参数
	 */
	getUrlParams(url: string): Record<string, any> {
		const regex = /[?&][^=?&]+=[^?&]+/g;
		const params: Record<string, any> = {};

		let match;
		while ((match = regex.exec(url)) !== null) {
			const [key, value] = match[0].substring(1).split("=");
			params[key] = decodeURIComponent(value);
		}

		return params;
	},
	/**
	 * 是否为JSON字符串
	 */
	isJson(value: string): boolean {
		if (!isString(value)) return false;

		value = value.replace(/\s/g, "").replace(/\n|\r/, "");

		if (/^\{(.*?)\}$/.test(value)) return /"(.*?)":(.*?)/g.test(value);

		if (/^\[(.*?)\]$/.test(value)) {
			return value
				.replace(/^\[/, "")
				.replace(/\]$/, "")
				.replace(/},{/g, "}\n{")
				.split(/\n/)
				.map((s) => {
					return stringUtil.isJson(s);
				})
				.reduce((prev, curr) => {
					return !!curr;
				});
		}

		return false;
	},
	/**
	 * 生成随机字符串
	 */
	generateRandomString(length: number): string {
		const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		let randomString = "";
		for (let i = 0; i < length; i++) {
			const randomIndex = Math.floor(Math.random() * characters.length);
			randomString += characters.charAt(randomIndex);
		}
		return randomString;
	},
	/**
	 * @description 生成唯一 uuid
	 */
	generateUUID(): string {
		let uuid = "";
		for (let i = 0; i < 32; i++) {
			const random = (Math.random() * 16) | 0;
			if (i === 8 || i === 12 || i === 16 || i === 20) uuid += "-";
			uuid += (i === 12 ? 4 : i === 16 ? (random & 3) | 8 : random).toString(16);
		}
		return uuid;
	},
	/**
	 * 复制
	 */
	async copy(value: string): Promise<void> {
		if (typeof uni !== "undefined") {
			return new Promise((resolve, reject) => {
				uni.setClipboardData({
					data: value,
					success: () => {
						resolve();
					},
					fail: () => {
						reject();
					},
				});
			});
		} else {
			// navigator.clipboard 需要https等安全上下文
			if (navigator?.clipboard && window.isSecureContext) {
				await navigator.clipboard.writeText(value);
			} else {
				const textareaEl = document.createElement("textarea");
				textareaEl.value = value;
				// 使文本域不显示
				textareaEl.style.position = "absolute";
				textareaEl.style.opacity = "0";
				textareaEl.style.left = "-999999px";
				textareaEl.style.top = "-999999px";
				document.body.appendChild(textareaEl);
				textareaEl.focus();
				textareaEl.select();
				document.execCommand("copy");
				textareaEl.remove();
			}
		}
	},
};
