/**
 * 构建 expose 和 vue.js devtools 状态查看
 */
export const useExpose = <Exposed extends Record<string, any> = Record<string, any>>(
	expose: (exposed?: Exposed) => void,
	exposed?: Exposed
): Exposed => {
	expose(exposed);

	return exposed;
};
