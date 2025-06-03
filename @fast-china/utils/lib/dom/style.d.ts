/**
 * 添加单位
 * @param value 字符串或数字类型
 * @param defaultUnit 单位
 */
export declare const addUnit: (value?: string | number, defaultUnit?: string) => string;
/**
 * 将样式对象转换为内联 style 字符串（kebab-case 格式）
 * @param style 样式对象（CSSStyleDeclaration）
 * @returns 返回符合 HTML 内联格式的样式字符串，例如 "font-size: 14px; color: red;"
 */
export declare const styleToString: (styles: Partial<CSSStyleDeclaration> | Partial<CSSStyleDeclaration>[] | string) => string;
