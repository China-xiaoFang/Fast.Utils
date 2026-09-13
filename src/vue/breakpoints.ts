import { computed, getCurrentScope, readonly, shallowRef } from "vue";
import { runtimeGlobals } from "../internal/runtime";
import { useEventListener } from "./event-listener";
import type { ComputedRef, ShallowRef } from "vue";

/** 断点名称与最小视口宽度的映射。 */
export type Breakpoints<Key extends string = string> = Readonly<Record<Key, number>>;

/** `useBreakpoints` 返回的断点状态。 */
export type UseBreakpointsReturn<Key extends string> = Readonly<Record<Key, Readonly<ShallowRef<boolean>>>> & {
	/** 返回当前命中的最大断点名称。 */
	active: () => ComputedRef<Key | "">;
};

/**
 * 使用原生 Media Query 创建响应式最小宽度断点。
 *
 * @param breakpoints - 断点名称与非负像素宽度的映射。
 * @returns 每个断点的只读状态和当前最大命中断点。
 * @throws `Error` 当浏览器环境中不存在可用于自动清理的 Vue 响应式作用域。
 * @throws `TypeError` 当断点使用保留名称 `active`。
 * @throws `RangeError` 当断点宽度不是非负有限数值。
 */
export function useBreakpoints<Key extends string>(breakpoints: Breakpoints<Key>): UseBreakpointsReturn<Key> {
	const entries = Object.entries(breakpoints) as [Key, number][];
	entries.sort((left, right) => left[1] - right[1]);
	for (const [name, minimumWidth] of entries) {
		if (name === "active") throw new TypeError("断点名称不能使用保留名称“active”。");
		if (!Number.isFinite(minimumWidth) || minimumWidth < 0) throw new RangeError(`断点“${name}”必须是非负有限数值。`);
	}
	const states = Object.create(null) as Record<Key, Readonly<ShallowRef<boolean>>>;
	const window = runtimeGlobals.window;
	if (window !== undefined && getCurrentScope() === undefined) {
		throw new Error("`useBreakpoints` 必须在 Vue 响应式作用域内调用。");
	}
	for (const [name, minimumWidth] of entries) {
		const state = shallowRef(false);
		if (window !== undefined && typeof window.matchMedia === "function") {
			const mediaQuery = window.matchMedia(`(min-width: ${minimumWidth}px)`);
			const update = () => {
				state.value = mediaQuery.matches;
			};
			update();
			useEventListener(mediaQuery, "change", update);
		}
		states[name] = readonly(state);
	}
	const active = computed<Key | "">(() => {
		let current: Key | "" = "";
		for (const [name] of entries) {
			if (states[name].value) current = name;
		}
		return current;
	});
	return Object.assign(states, { active: () => active });
}
