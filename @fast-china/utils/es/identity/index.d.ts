declare const state: {
    cacheKey: string;
    deviceId: string;
};
export declare const useIdentity: () => typeof state & {
    makeIdentity: () => string;
};
export {};
