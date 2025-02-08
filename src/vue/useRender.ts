import type { VNode } from "vue";
import { getCurrentInstance } from "vue";

/**
 * 使用渲染
 * @description 为了解决使用 TSX 语法返回渲染函数，状态不会出现在 vue.js devtools 中
 */
export const useRender = (render: () => VNode): void => {
	const vm = getCurrentInstance() as any;
	if (!vm) {
		throw new Error("useRender must be called from inside a setup function");
	}
	vm.render = render;
};
