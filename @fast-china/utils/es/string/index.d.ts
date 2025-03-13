/**
 * 字符串工具类
 */
export declare const stringUtil: {
    /**
     * 获取Url参数
     */
    getUrlParams(url: string): Record<string, any>;
    /**
     * 是否为JSON字符串
     */
    isJson(value: string): boolean;
    /**
     * 切割骆驼命名式字符串
     */
    splitCamelCase(value: string): string[];
    /**
     * 将字符串转为 camelCase 格式，支持 - 或 _ 分隔的字符串
     * 例如：'hello-world' 或 'hello_world' => 'helloWorld'
     */
    toCamelCase(value: string): string;
    /**
     * 字符串首字母大写
     */
    firstCharToUpper(value: string): string;
    /**
     * 字符串首字母小写
     */
    firstCharToLower(value: string): string;
    /**
     * 截取指定长度的字符串
     */
    subStringWithEllipsis(value: string, length: number, suffix?: string): string;
    /**
     * 生成随机字符串
     */
    generateRandomString(length: number): string;
    /**
     * @description 生成唯一 uuid
     */
    generateUUID(): string;
    /**
     * 复制
     */
    copy(value: string): Promise<void>;
};
