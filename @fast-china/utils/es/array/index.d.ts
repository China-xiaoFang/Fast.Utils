/**
 * 数据工具类
 */
export declare const arrayUtil: {
    /**
     * 是否存在重复值
     * @param arr 数组
     * @param prop 属性
     * @returns
     */
    hasDuplicateProperty<T>(arr: T[], prop: keyof T | (keyof T)[]): boolean;
    /**
     * 是否存在非重复值
     * @param arr 数组
     * @param prop 属性
     * @returns
     */
    hasDifferentProperty<T>(arr: T[], prop: keyof T | (keyof T)[]): boolean;
};
