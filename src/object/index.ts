/**
 * 对象工具类
 */
export const objectUtil = {
	/**
	 * 对象URL参数化
	 */
	objectToQueryString(obj: any): string {
		let params = "";
		for (const key in obj) {
			if (Object.prototype.hasOwnProperty.call(obj, key)) {
				if (params !== "") {
					params += "&";
				}
				params += `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`;
			}
		}
		return params;
	},
};
