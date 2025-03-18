declare const state: {
    cacheKey: string;
    deviceId: string;
};
/**
 * 生成设备Id
 * @param deviceID 覆盖的设备Id
 * @returns
 */
declare const makeIdentity: (deviceID?: string) => string;
export declare const useIdentity: () => typeof state & {
    makeIdentity: typeof makeIdentity;
};
export {};
