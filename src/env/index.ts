/**
 * 环境工具类
 */
export const envUtil = {
	/**
	 * 是否为 Uni 环境
	 * @returns
	 */
	isUni(): boolean {
		return typeof uni !== "undefined";
	},
	/**
	 * 是否为 Web 环境（浏览器环境）
	 * @returns
	 */
	isWeb(): boolean {
		return typeof window !== "undefined" && typeof window.document !== "undefined";
	},
	/**
	 * 是否为手机设备
	 * @returns
	 */
	isMobile(): boolean {
		if (!this.isWeb()) return false;
		const ua = navigator.userAgent || "";
		// Windows Phone 也归类为手机
		return /Mobile|iPhone|Android.*Mobile|Windows Phone/i.test(ua);
	},
	/**
	 * 是否为平板设备
	 * @returns
	 */
	isIpad(): boolean {
		if (!this.isWeb()) return false;
		const ua = navigator.userAgent || "";
		// iPad 或 Android 平板通常不带 Mobile 字符串
		return /iPad|Android(?!.*Mobile)|Tablet/i.test(ua);
	},
};
