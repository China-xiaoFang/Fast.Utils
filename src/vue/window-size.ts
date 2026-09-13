import { getCurrentScope, readonly, shallowRef } from "vue";
import { runtimeGlobals } from "../internal/runtime";
import { useEventListener } from "./event-listener";
import type { ShallowRef } from "vue";

/** `useWindowSize` 返回的只读窗口尺寸。 */
export interface UseWindowSizeReturn {
	readonly width: Readonly<ShallowRef<number>>;
	readonly height: Readonly<ShallowRef<number>>;
}

/**
 * 响应式读取浏览器窗口内部尺寸。
 *
 * @returns 随原生 `resize` 事件更新的只读宽度和高度；非浏览器环境均为 `0`。
 * @throws `Error` 当浏览器环境中不存在可用于自动清理的 Vue 响应式作用域。
 */
export function useWindowSize(): UseWindowSizeReturn {
	const width = shallowRef(0);
	const height = shallowRef(0);
	const window = runtimeGlobals.window;
	if (window !== undefined) {
		if (getCurrentScope() === undefined) throw new Error("`useWindowSize` 必须在 Vue 响应式作用域内调用。");
		const update = () => {
			width.value = window.innerWidth;
			height.value = window.innerHeight;
		};
		update();
		useEventListener(window, "resize", update, { passive: true });
	}
	return { height: readonly(height), width: readonly(width) };
}
