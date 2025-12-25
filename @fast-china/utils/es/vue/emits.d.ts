import { ComputedRef, EmitFn } from 'vue';
/**
 * 构建 emits
 * @param emits emits 配置
 * @param emit emit 函数
 * @param ignoreRawEmits 忽略 原生 emits 的 key
 */
export declare const useEmits: <T extends Record<string, (...args: any[]) => void>>(emits: T, emit?: EmitFn<T>, ignoreRawEmits?: (keyof T)[]) => ComputedRef<Record<string, (...args: any[]) => void>>;
