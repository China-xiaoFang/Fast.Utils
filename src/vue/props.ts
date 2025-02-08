import type { ComputedRef, PropType } from "vue";
import { computed } from "vue";
import { omit, pick } from "lodash-unified";

export const definePropType = <T>(val: any): PropType<T> => val;

/**
 * 构建 props
 * @param props props
 * @param rawProps 原生 props
 * @param ignoreRawProps 忽略 原生 props 的 key
 */
export const useProps = <T extends Record<string, unknown>, RT extends Record<string, unknown>>(
	props: T,
	rawProps?: RT,
	ignoreRawProps?: (keyof RT)[]
): ComputedRef<Record<string, unknown>> => {
	if (!props) return computed(() => ({}));

	return computed<Record<string, unknown>>(() => {
		const omittedRawProps = rawProps ? omit(rawProps, ignoreRawProps ?? []) : {};
		return pick(props, Object.keys(omittedRawProps)) as Record<string, unknown>;
	});
};
