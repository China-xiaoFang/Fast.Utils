/**
 * 构建 expose 和 vue.js devtools 状态查看
 */
export declare const useExpose: <Exposed extends Record<string, any> = Record<string, any>>(expose: (exposed?: Exposed) => void, exposed?: Exposed) => Exposed;
