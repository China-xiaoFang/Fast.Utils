/**
 * 对象工具类
 */
export declare const objectUtil: {
    /**
     * 对象URL参数化
     */
    objectToQueryString(obj: any): string;
    /**
     * 是否存在重复值
     */
    hasDuplicateProperty<T>(arr: T[], prop: keyof T): boolean;
    /**
     * 是否存在非重复值
     */
    hasDifferentProperty<T>(arr: T[], prop: keyof T): boolean;
    /**
     * 时间处理翻译
     */
    dateTimeFix(date: string | Date | null | undefined): string;
};
