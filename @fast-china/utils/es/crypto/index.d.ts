/**
 * 加密解密
 */
export declare const cryptoUtil: {
    /**
     * AES
     */
    aes: {
        /**
         * AES加密
         * @param dataStr 要加密的字符串
         * @param key 用于加密的密钥
         * @param vector 用于加密的向量（IV）
         * @param cipherMode 加密模式，默认为CBC模式
         */
        encrypt(dataStr: string, key: string, vector: string, cipherMode?: any): string;
        /**
         * AES解密
         * @param dataStr 要解密的Base64编码字符串
         * @param key 用于解密的密钥
         * @param vector 用于解密的向量（IV）
         * @param cipherMode 解密模式，默认为CBC模式
         */
        decrypt<T = string>(dataStr: string, key: string, vector: string, cipherMode?: any): T | null;
    };
    /**
     * SHA1
     */
    sha1: {
        /**
         * SHA1加密
         * @param dataStr 要加密的字符串
         */
        encrypt(dataStr: string): string;
    };
    /**
     * MD5
     */
    MD5: {
        /**
         * MD5加密
         * @param dataStr 要加密的字符串
         */
        encrypt(dataStr: string): string;
    };
};
