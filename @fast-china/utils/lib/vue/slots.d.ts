import { SlotsType, VNode } from 'vue';
type RawSlots = Record<string, unknown>;
type VueSlots<T> = [T] extends [never] ? () => VNode[] : (arg: T) => VNode[];
type MakeSlots<T extends RawSlots> = {
    [K in keyof T]: VueSlots<T[K]>;
};
/**
 * 构建 slots
 */
export declare const makeSlots: <Slots extends RawSlots>() => SlotsType<Partial<MakeSlots<Slots>>>;
export {};
