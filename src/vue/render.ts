import { getCurrentInstance } from "vue";

import type { VNode } from "vue";

/** Vue 2.7 与 Vue 3 组件实例中渲染函数可能出现的位置。 */
interface CompatibleVueInstance {
	/** Vue 2.7 兼容实例上的公共代理。 */
	proxy?: CompatibleVueProxy;
	/** Vue 3 内部组件实例直接持有的渲染函数。 */
	render?: () => VNode;
}

/** Vue 2.7 公共代理中允许写入渲染函数的最小结构。 */
interface CompatibleVueProxy {
	/** 当前组件的可变 Options API 配置。 */
	$options?: CompatibleVueOptions;
}

/** TSX Helper 需要写入的最小组件选项。 */
interface CompatibleVueOptions {
	/** 当前组件渲染函数；调用 {@link useRender} 后替换为传入函数。 */
	render?: () => VNode;
}

/**
 * 在当前 Vue 2.7/3 组件实例上安装 TSX 渲染函数。
 *
 * @remarks 组件的 `setup` 可以继续返回状态对象，因此状态能够显示在 Vue Devtools 中。
 * @param render - 当前组件的渲染函数。
 * @throws 不在组件 `setup` 调用栈中使用时抛出 `Error`。
 */
export function useRender(render: () => VNode): void {
	const instance = getCurrentInstance();
	if (instance === null) throw new Error("useRender must be called from inside a setup function.");
	const compatible = instance as unknown as CompatibleVueInstance;
	if (compatible.proxy?.$options !== undefined && !("render" in compatible)) {
		compatible.proxy.$options.render = render;
		return;
	}
	compatible.render = render;
}
