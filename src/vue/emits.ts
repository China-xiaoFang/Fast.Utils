import { computed } from "vue";
import { omit } from "lodash-unified";
import type { ComputedRef, EmitFn } from "vue";

/**
 * 构建 emits
 * @param emits emits 配置
 * @param emit emit 函数
 * @param ignoreRawEmits 忽略 原生 emits 的 key
 */
export const useEmits = <T extends Record<string, (...args: any[]) => void>>(
	emits: T,
	emit?: EmitFn<T>,
	ignoreRawEmits?: (keyof T)[]
): ComputedRef<Record<string, (...args: any[]) => void>> => {
	if (!emits) return computed(() => ({}));

	return computed<Record<string, (...args: any[]) => void>>(() => {
		const omittedRawEmits = emits ? omit(emits, ignoreRawEmits ?? []) : {};
		// 提取对应的事件处理器
		return Object.keys(omittedRawEmits).reduce((handlers, eventName) => {
			// 将 emit 名称转换为事件处理器名称:  'update:modelValue' -> 'onUpdate:modelValue'
			const handlerName = `on${eventName
				.split("-")
				.map((part, index) => (index === 0 ? part.charAt(0).toUpperCase() + part.slice(1) : part.charAt(0).toUpperCase() + part.slice(1)))
				.join("")}`;

			handlers[handlerName] = (...args: any[]): void => emit(eventName, ...args);
			return handlers;
		}, {});
	});
};
