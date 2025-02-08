import { ComputedRef, PropType } from 'vue';
export declare const definePropType: <T>(val: any) => PropType<T>;
/**
 * 构建 props
 * @param props props
 * @param rawProps 原生 props
 * @param ignoreRawProps 忽略 原生 props 的 key
 */
export declare const useProps: <T extends Record<string, unknown>, RT extends Record<string, unknown>>(props: T, rawProps?: RT, ignoreRawProps?: (keyof RT)[]) => ComputedRef<Record<string, unknown>>;
