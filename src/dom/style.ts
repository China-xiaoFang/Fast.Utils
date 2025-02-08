import { isNumber, isString } from "lodash-unified";
import { consoleWarn } from "src/console";

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
