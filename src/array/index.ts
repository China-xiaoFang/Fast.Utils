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
	hasDuplicateProperty<T>(arr: T[], prop: keyof T): boolean {
		const values = arr.map((obj) => obj[prop]);
		const uniqueValues = new Set(values);
		return values.length !== uniqueValues.size;
	},
	/**
	 * 是否存在非重复值
	 * @param arr 数组
	 * @param prop 属性
	 * @returns
	 */
	hasDifferentProperty<T>(arr: T[], prop: keyof T): boolean {
		const valueSet = new Set<any>();
		for (const obj of arr) {
			valueSet.add(obj[prop]);
			if (valueSet.size > 1) {
				return true;
			}
		}
		return false;
	},
};
