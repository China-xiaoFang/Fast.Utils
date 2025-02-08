/**
 * 执行方法
 * @param fn 要执行的方法
 * @param args 参数
 */
export declare const execFunction: <T = void>(fn: Function, ...args: any[]) => Promise<T>;
