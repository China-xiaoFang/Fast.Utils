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
	/**
	 * 是否存在重复值
	 */
	hasDuplicateProperty<T>(arr: T[], prop: keyof T): boolean {
		const values = arr.map((obj) => obj[prop]);
		const uniqueValues = new Set(values);
		return values.length !== uniqueValues.size;
	},
	/**
	 * 是否存在非重复值
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
	/**
	 * 时间处理翻译
	 */
	dateTimeFix(date: string | Date | null | undefined): string {
		if (date !== null && date !== undefined && date) {
			if (typeof date === "string") {
				date = new Date(date);
			}

			// 获取时间戳
			let timestamp = date.getTime();
			if (timestamp.toString().length < 13) {
				const arrTimestamp = timestamp.toString().split("");
				for (let start = 0; start < 13; start++) {
					if (!arrTimestamp[start]) {
						arrTimestamp[start] = "0";
					}
				}
				timestamp = parseInt(arrTimestamp.join(""));
			}
			const minute = 1000 * 60;
			const hour = minute * 60;
			const day = hour * 24;
			const month = day * 30;
			// 获取当前时间
			const curTime = new Date().getTime();
			// 比较
			const diffValue = curTime - timestamp;

			// 计算差异时间的量级
			const monthC = diffValue / month;
			const weekC = diffValue / (7 * day);
			const dayC = diffValue / day;
			const hourC = diffValue / hour;
			const minC = diffValue / minute;

			// 如果本地时间反而小于变量时间
			if (diffValue < 0) {
				const monthC1 = Math.abs(monthC);
				const weekC1 = Math.abs(weekC);
				const dayC1 = Math.abs(dayC);
				const hourC1 = Math.abs(hourC);
				const minC1 = Math.abs(minC);

				if (monthC1 > 12) {
					// 超过1年，直接显示 几 年前
					return `${parseInt(`${monthC1 / 12}`)}年后`;
				} else if (monthC1 >= 6) {
					return "半年后";
				} else if (monthC1 >= 1) {
					return `${parseInt(`${monthC1}`)}月后`;
				} else if (weekC1 > 2) {
					return "半月后";
				} else if (weekC1 >= 1) {
					return `${parseInt(`${weekC1}`)}周后`;
				} else if (dayC1 >= 1) {
					return `${parseInt(`${dayC1}`)}天后`;
				} else if (hourC1 >= 1) {
					return `${parseInt(`${hourC1}`)}小时后`;
				} else if (minC1 >= 1) {
					return `${parseInt(`${minC1}`)}分钟后`;
				}
				return "刚刚";
				// return "不久前";
			}

			// 使用
			if (monthC > 12) {
				// 超过1年，直接显示 几 年前
				return `${parseInt(`${monthC / 12}`)}年前`;
			} else if (monthC >= 6) {
				return "半年前";
			} else if (monthC >= 1) {
				return `${parseInt(`${monthC}`)}月前`;
			} else if (weekC > 2) {
				return "半月前";
			} else if (weekC >= 1) {
				return `${parseInt(`${weekC}`)}周前`;
			} else if (dayC >= 1) {
				return `${parseInt(`${dayC}`)}天前`;
			} else if (hourC >= 1) {
				return `${parseInt(`${hourC}`)}小时前`;
			} else if (minC >= 1) {
				return `${parseInt(`${minC}`)}分钟前`;
			}
			return "刚刚";
		} else {
			return "";
		}
	},
};
