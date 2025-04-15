/**
 * 数据工具类
 */
export const arrayUtil = {
	/**
	 * 是否存在重复值
	 * @param arr 数组
	 * @param prop 属性
	 * @returns
	 */
	hasDuplicateProperty<T>(arr: T[], prop: keyof T | (keyof T)[]): boolean {
		if (Array.isArray(prop)) {
			const seen = new Set<string>();
			for (const obj of arr) {
				const key = JSON.stringify(prop.map((p) => obj[p]));
				if (seen.has(key)) return true;
				seen.add(key);
			}
			return false;
		} else {
			const seen = new Set<any>();
			for (const obj of arr) {
				const value = obj[prop];
				if (seen.has(value)) return true;
				seen.add(value);
			}
			return false;
		}
	},
	/**
	 * 是否存在非重复值
	 * @param arr 数组
	 * @param prop 属性
	 * @returns
	 */
	hasDifferentProperty<T>(arr: T[], prop: keyof T | (keyof T)[]): boolean {
		if (arr.length <= 1) return false;

		if (Array.isArray(prop)) {
			const firstKey = JSON.stringify(prop.map((p) => arr[0][p]));
			for (let i = 1; i < arr.length; i++) {
				const currentKey = JSON.stringify(prop.map((p) => arr[i][p]));
				if (currentKey !== firstKey) return true;
			}
		} else {
			const firstValue = arr[0][prop];
			for (let i = 1; i < arr.length; i++) {
				if (arr[i][prop] !== firstValue) return true;
			}
		}
		return false;
	},
};
