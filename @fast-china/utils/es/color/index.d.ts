/**
 * 颜色工具类
 */
export declare const colorUtil: {
    /**
     * hex颜色转rgb颜色
     * @param str 颜色值字符串
     * @returns 返回处理后的颜色值
     */
    hexToRgb(str: any): any;
    /**
     * rgb颜色转Hex颜色
     * @param r 代表红色
     * @param g 代表绿色
     * @param b 代表蓝色
     * @returns 返回处理后的颜色值
     */
    rgbToHex(r: any, g: any, b: any): string;
    /**
     * 加深颜色值
     * @param color 颜色值字符串
     * @param level 加深的程度，限0-1之间
     * @returns 返回处理后的颜色值
     */
    getDarkColor(color: string, level: number): string;
    /**
     * 变浅颜色值
     * @param color 颜色值字符串
     * @param level 加深的程度，限0-1之间
     * @returns 返回处理后的颜色值
     */
    getLightColor(color: string, level: number): string;
};
