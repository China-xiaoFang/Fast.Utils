/**
 * 对象工具类
 */
export declare const objectUtil: {
    /**
     * 对象URL参数化
     */
    objectToQueryString(obj: any): string;
    /**
     * 将外部传入的样式格式化成可读的 CSS 样式。
     */
    objectToStyle(styles: string | Record<string, any> | Record<string, any>[]): string;
};
