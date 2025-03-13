/**
 * Base64工具类
 */
export declare const base64Util: {
    /**
     * 将字符串编码为Base64格式
     */
    bota(string: string): string;
    /**
     * 将Base64编码的字符串解码回其原始格式。
     */
    atob(string: string): string;
    /**
     * 字符串ToBase64
     */
    toBase64(str: string, prefixStrLength?: number): string;
    /**
     * Base64转字符串
     */
    base64ToStr(str: string, prefixStrLength?: number): string;
};
