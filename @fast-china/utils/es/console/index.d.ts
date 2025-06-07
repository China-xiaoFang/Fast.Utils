export declare const useConsole: () => {
    /**
     * 设置 Uni-App 在 APP-PLUS 下是否拆分输出
     */
    setUniAppPlusSplit(value: boolean): void;
};
/**
 * 打印 Log 日志
 * @param name 来源名称
 */
export declare const consoleLog: (name: string, message?: string | false, error?: any) => void;
/**
 * 打印 Warn 日志
 * @param name 来源名称
 */
export declare const consoleWarn: (name: string, message?: string | false, error?: any) => void;
/**
 * 打印 Debug 日志
 * @param name 来源名称
 */
export declare const consoleDebug: (name: string, message?: string | false, error?: any) => void;
/**
 * 打印 Error 日志
 * @param name 来源名称
 */
export declare const consoleError: (name: string, message?: any) => void;
/**
 * 抛出错误
 * @param name 来源名称
 */
export declare const throwError: (name: string, message?: any) => never;
