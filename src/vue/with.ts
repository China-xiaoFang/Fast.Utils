/**
 * 定义类型数据
 * @description 传入什么就返回什么，用来定义reactive或其他对象的响应式数据
 */
export const withDefineType = <T>(data: T = undefined): T => {
	return data;
};
