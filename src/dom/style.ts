import { isArray, isNumber, isString } from "lodash-unified";
import { consoleWarn } from "../console";

const isStringNumber = (val: string): boolean => {
	if (!isString(val)) {
		return false;
	}
	return !Number.isNaN(Number(val));
};

/**
 * 添加单位
 * @param value 字符串或数字类型
 * @param defaultUnit 单位
 */
export const addUnit = (value?: string | number, defaultUnit = "px"): string => {
	if (!value) return "";
	if (isNumber(value) || isStringNumber(value)) {
		return `${value}${defaultUnit}`;
	} else if (isString(value)) {
		return value;
	}
	consoleWarn("document", "binding value must be a string or number");
};

/**
 * 将样式对象转换为内联 style 字符串（kebab-case 格式）
 * @param style 样式对象（CSSStyleDeclaration）
 * @returns 返回符合 HTML 内联格式的样式字符串，例如 "font-size: 14px; color: red;"
 */
export const styleToString = (styles: Partial<CSSStyleDeclaration> | Partial<CSSStyleDeclaration>[] | string): string => {
	if (!styles) return "";
	if (isArray(styles)) {
		return styles
			.filter((item) => item && item?.length > 0)
			.map((item) => styleToString(item))
			.join(" ");
	} else if (isString(styles)) {
		return styles.trimEnd().endsWith(";") ? styles.trimEnd() : `${styles.trimEnd()};`;
	} else {
		return Object.entries(styles)
			.filter(([_, value]) => value !== null && value !== "")
			.map(([key, value]) => {
				const keyName = key.replace(/([A-Z])/g, "-$1").toLowerCase();
				return `${keyName}: ${value};`;
			})
			.join(" ");
	}
};
