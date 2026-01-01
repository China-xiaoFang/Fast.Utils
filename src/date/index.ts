import { isNil } from "lodash-unified";

/**
 * Date工具类
 */
export const dateUtil = {
	/**
	 * 根据当前时间生成问候语
	 */
	getGreet(): string {
		const now = new Date();
		const hour = now.getHours();
		let greet = "";

		if (hour < 5) {
			greet = "夜深了，注意身体哦！";
		} else if (hour < 9) {
			greet = "早上好！" + "欢迎回来！";
		} else if (hour < 12) {
			greet = "上午好！" + "欢迎回来！";
		} else if (hour < 14) {
			greet = "中午好！" + "欢迎回来！";
		} else if (hour < 18) {
			greet = "下午好！" + "欢迎回来！";
		} else if (hour < 24) {
			greet = "晚上好！" + "欢迎回来！";
		} else {
			greet = "您好！" + "欢迎回来！";
		}
		return greet;
	},
	/**
	 * 时间处理翻译
	 */
	dateTimeFix(date: number | string | Date | null | undefined): string {
		if (isNil(date)) {
			return "";
		}

		// 获取时间戳
		let timestamp: number;
		if (typeof date === "string") {
			timestamp = new Date(date).getTime();
		} else if (typeof date === "number") {
			// 更安全的秒级时间戳判断：小于10位数字认为是秒级
			timestamp = date.toString().length <= 10 ? date * 1000 : date;
		} else {
			timestamp = date.getTime();
		}

		const minute = 1000 * 60;
		const hour = minute * 60;
		const day = hour * 24;

		// 获取当前时间
		const curTime = new Date().getTime();
		// 计算差异
		const diffValue = curTime - timestamp;

		// 计算差异时间的量级
		const minC = Math.abs(diffValue) / minute;
		const hourC = Math.abs(diffValue) / hour;
		const dayC = Math.abs(diffValue) / day;

		// 使用Date对象来准确计算月份和年份差异
		const curDate = new Date(curTime);
		const targetDate = new Date(timestamp);

		const yearDiff = curDate.getFullYear() - targetDate.getFullYear();
		const monthDiff = curDate.getMonth() - targetDate.getMonth();
		const totalMonthDiff = yearDiff * 12 + monthDiff;

		// 时间后缀
		const suffix = diffValue < 0 ? "后" : "前";

		// 计算显示逻辑
		if (Math.abs(totalMonthDiff) >= 12) {
			const years = Math.floor(Math.abs(totalMonthDiff) / 12);
			return `${years}年${suffix}`;
		} else if (Math.abs(totalMonthDiff) >= 6) {
			return `半年${suffix}`;
		} else if (Math.abs(totalMonthDiff) >= 1) {
			return `${Math.abs(totalMonthDiff)}月${suffix}`;
		} else if (dayC >= 15) {
			return `半月${suffix}`;
		} else if (dayC >= 7) {
			const weeks = Math.floor(dayC / 7);
			return `${weeks}周${suffix}`;
		} else if (dayC >= 1) {
			return `${Math.floor(dayC)}天${suffix}`;
		} else if (hourC >= 1) {
			return `${Math.floor(hourC)}小时${suffix}`;
		} else if (minC >= 1) {
			return `${Math.floor(minC)}分钟${suffix}`;
		}

		return "刚刚";
	},
	/**
	 * 获取默认时间
	 * @returns [00:00:00, 23:59:59]
	 */
	getDefaultTime(): Date[] {
		const end = new Date();
		const start = new Date();
		start.setMonth(start.getMonth() - 1);
		start.setHours(0, 0, 0);
		end.setHours(23, 59, 59);
		return [start, end];
	},
	/**
	 * 获取简单的日期时间
	 * @returns xxxx-xx-xx 00:00:00
	 */
	getSimpleTime(): Date {
		const start = new Date();
		start.setHours(0, 0, 0);
		return start;
	},
	/**
	 * 获取简单的日期时间范围
	 */
	getSimpleShortcuts(): {
		text: string;
		value: () => Date;
	}[] {
		return [
			{
				text: "今天",
				value: (): Date => {
					const date = new Date();
					date.setHours(0, 0, 0);
					return date;
				},
			},
			{
				text: "昨天",
				value: (): Date => {
					const date = new Date();
					date.setDate(date.getDate() - 1);
					date.setHours(0, 0, 0);
					return date;
				},
			},
			{
				text: "一周前",
				value: (): Date => {
					const date = new Date();
					date.setDate(date.getDate() - 7);
					date.setHours(0, 0, 0);
					return date;
				},
			},
			{
				text: "一月前",
				value: (): Date => {
					const date = new Date();
					date.setMonth(date.getMonth() - 1);
					date.setHours(0, 0, 0);
					return date;
				},
			},
			{
				text: "一年前",
				value: (): Date => {
					const date = new Date();
					date.setFullYear(date.getFullYear() - 1);
					date.setHours(0, 0, 0);
					return date;
				},
			},
		];
	},
	/**
	 * 获取日期范围
	 */
	getShortcuts(): {
		text: string;
		value: () => Date[];
	}[] {
		return [
			{
				text: "近1天",
				value: (): Date[] => {
					const end = new Date();
					const start = new Date();
					start.setDate(start.getDate() - 1);
					start.setHours(0, 0, 0);
					end.setHours(23, 59, 59);
					return [start, end];
				},
			},
			{
				text: "近3天",
				value: (): Date[] => {
					const end = new Date();
					const start = new Date();
					start.setDate(start.getDate() - 3);
					start.setHours(0, 0, 0);
					end.setHours(23, 59, 59);
					return [start, end];
				},
			},
			{
				text: "近1周",
				value: (): Date[] => {
					const end = new Date();
					const start = new Date();
					start.setDate(start.getDate() - 7);
					start.setHours(0, 0, 0);
					end.setHours(23, 59, 59);
					return [start, end];
				},
			},
			{
				text: "近1月",
				value: (): Date[] => {
					const end = new Date();
					const start = new Date();
					start.setMonth(start.getMonth() - 1);
					start.setHours(0, 0, 0);
					end.setHours(23, 59, 59);
					return [start, end];
				},
			},
			{
				text: "近3月",
				value: (): Date[] => {
					const end = new Date();
					const start = new Date();
					start.setMonth(start.getMonth() - 3);
					start.setHours(0, 0, 0);
					end.setHours(23, 59, 59);
					return [start, end];
				},
			},
			{
				text: "近6月",
				value: (): Date[] => {
					const end = new Date();
					const start = new Date();
					start.setMonth(start.getMonth() - 6);
					start.setHours(0, 0, 0);
					end.setHours(23, 59, 59);
					return [start, end];
				},
			},
			{
				text: "近1年",
				value: (): Date[] => {
					const end = new Date();
					const start = new Date();
					start.setFullYear(start.getFullYear() - 1);
					start.setHours(0, 0, 0);
					end.setHours(23, 59, 59);
					return [start, end];
				},
			},
		];
	},
	/**
	 * 判断传入的时间是否大于当前时间
	 */
	getDisabledDate(time: Date): boolean {
		return time.getTime() > Date.now();
	},
};
