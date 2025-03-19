/**
 * 本地缓存前缀 Key
 */
export declare const CACHE_PREFIX: import('vue').ComputedRef<string>;
/**
 * 本地缓存过期值后缀 Key
 */
export declare const CACHE_EXPIRE_SUFFIX: import('vue').ComputedRef<string>;
export declare const useStorage: () => {
    /**
     * 设置缓存前缀 Key
     * @param key
     */
    setPrefix(key: string): void;
    /**
     * 缓存过期值后缀 Key
     * @param key
     */
    setExpireSuffix(key: string): void;
    /**
     * 设置缓存是否加密
     * @description 请在初始化的时候确认，后续不可再修改，否则所有数据都将失效
     * @param crypto
     */
    setCrypto(crypto: boolean): void;
};
/**
 * window.localStorage
 * - 如果是 UniApp 环境则使用的是 uni.xxxStorage
 */
export declare const Local: {
    /**
     * 设置
     * @param key 缓存的Key
     * @param val 缓存值
     * @param expire 过期时间，单位分钟
     * @param encrypt 是否对缓存的数据加密
     */
    set(key: string, val: any, expire?: number, encrypt?: boolean): void;
    /**
     * 获取
     * @param key 缓存的Key
     * @param decrypt 是否对缓存的数据解密
     * @returns {T} 传入的对象类型，默认为 string
     */
    get<T = string>(key: string, decrypt?: boolean): T;
    /**
     * 移除
     * @param key 缓存的Key
     */
    remove(key: string): void;
    /**
     * 根据前缀移除
     * @param key 缓存的Key
     */
    removeByPrefix(key: string): void;
    /**
     * 移除全部
     */
    clear(): void;
};
/**
 * window.sessionStorage
 * - UniApp 环境下不可用
 */
export declare const Session: {
    /**
     * 设置会话缓存
     * @param key 缓存的Key
     * @param val 缓存值
     * @param expire 过期时间，单位分钟
     * @param encrypt 是否对缓存的数据加密
     */
    set(key: string, val: any, expire?: number, encrypt?: boolean): void;
    /**
     * 获取会话缓存
     * @param key 缓存的Key
     * @param decrypt 是否对缓存的数据解密
     * @returns {T} 传入的对象类型，默认为 string
     */
    get<T = string>(key: string, decrypt?: boolean): T;
    /**
     * 移除会话缓存
     * @param key 缓存的Key
     */
    remove(key: string): void;
    /**
     * 根据前缀移除会话缓存
     * @param key 缓存的Key
     */
    removeByPrefix(key: string): void;
    /**
     * 移除全部会话缓存
     */
    clear(): void;
};
