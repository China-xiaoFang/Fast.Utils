/**
 * 点击工具类
 */
export declare const clickUtil: {
    /**
     * 防抖
     * @param fn - 执行函数
     * @param delay - 延时毫秒
     * @returns 返回一个新的防抖函数
     */
    debounce(fn: () => void, delay?: number): void;
    /**
     * 异步防抖
     * @param fn - 执行函数
     * @param delay - 延时毫秒
     * @returns 返回一个新的防抖函数
     */
    debounceAsync(fn: () => Promise<void>, delay?: number): Promise<void>;
    /**
     * 节流
     * @param fn - 执行函数
     * @param delay - 延时毫秒
     * @returns 返回一个新的节流函数
     */
    throttle(fn: () => void, delay?: number): void;
    /**
     * 异步节流
     * @param fn - 执行函数
     * @param delay - 延时毫秒
     * @returns 返回一个新的节流函数
     */
    throttleAsync(fn: () => Promise<void>, delay?: number): Promise<void>;
};
