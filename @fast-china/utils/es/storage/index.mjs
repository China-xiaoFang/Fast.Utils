import { reactive, computed } from "vue";
import { base64Util } from "../base64/index.mjs";
import { consoleError } from "../console/index.mjs";
const state = reactive({
  prefix: "fast__",
  expireSuffix: "__Expire",
  crypto: false
});
const CACHE_PREFIX = computed(() => state.prefix);
const CACHE_EXPIRE_SUFFIX = computed(() => state.expireSuffix);
const useStorage = () => {
  return {
    /**
     * 设置缓存前缀 Key
     * @param key
     */
    prefix(key) {
      state.prefix = key;
    },
    /**
     * 缓存过期值后缀 Key
     * @param key
     */
    expireSuffix(key) {
      state.expireSuffix = key;
    },
    /**
     * 设置缓存是否加密
     * @param crypto
     */
    crypto(crypto) {
      state.crypto = crypto;
    }
  };
};
const storage = {
  set(key, val) {
    if (typeof uni !== "undefined") {
      uni.setStorageSync(key, val);
    } else {
      window.localStorage.setItem(key, val);
    }
  },
  get(key) {
    if (typeof uni !== "undefined") {
      return uni.getStorageSync(key);
    } else {
      return window.localStorage.getItem(key);
    }
  },
  remove(key) {
    if (typeof uni !== "undefined") {
      uni.removeStorageSync(key);
    } else {
      window.localStorage.removeItem(key);
    }
  },
  clear() {
    if (typeof uni !== "undefined") {
      uni.clearStorageSync();
    } else {
      window.localStorage.clear();
    }
  },
  keys() {
    if (typeof uni !== "undefined") {
      return uni.getStorageInfoSync().keys;
    } else {
      return window.localStorage;
    }
  }
};
const Local = {
  /**
   * 设置
   * @param key 缓存的Key
   * @param val 缓存值
   * @param expire 过期时间，单位分钟
   * @param encrypt 是否对缓存的数据加密
   */
  set(key, val, expire, encrypt) {
    try {
      encrypt ?? (encrypt = state.crypto);
      if (expire) {
        if (isNaN(expire) || expire < 1) {
          throw new Error("有效期应为一个有效数值");
        }
        const expireData = {
          time: Date.now(),
          expire
        };
        const expireJson = JSON.stringify(expireData);
        storage.set(`${state.prefix}${key}${state.expireSuffix}`, expireJson);
      }
      let valJson = JSON.stringify(val);
      if (encrypt) {
        valJson = base64Util.toBase64(valJson);
      }
      storage.set(`${state.prefix}${key}`, valJson);
    } catch (error) {
      consoleError("Local", error);
    }
  },
  /**
   * 获取
   * @param key 缓存的Key
   * @param decrypt 是否对缓存的数据解密
   * @returns {T} 传入的对象类型，默认为 string
   */
  get(key, decrypt) {
    try {
      decrypt ?? (decrypt = state.crypto);
      let valJson = storage.get(`${state.prefix}${key}`);
      if (valJson) {
        if (decrypt) {
          valJson = base64Util.base64ToStr(valJson);
        }
        const expireJson = storage.get(`${state.prefix}${key}${state.expireSuffix}`);
        if (expireJson) {
          const expireData = JSON.parse(expireJson);
          if (Date.now() > expireData.time + expireData.expire * 60 * 1e3) {
            storage.remove(`${state.prefix}${key}`);
            storage.remove(`${state.prefix}${key}${state.expireSuffix}`);
            return null;
          }
        }
        try {
          return JSON.parse(valJson);
        } catch {
          return valJson;
        }
      }
      return null;
    } catch (error) {
      consoleError("Local", error);
    }
  },
  /**
   * 移除
   * @param key 缓存的Key
   */
  remove(key) {
    try {
      storage.remove(`${state.prefix}${key}`);
      storage.remove(`${state.prefix}${key}${state.expireSuffix}`);
    } catch (error) {
      consoleError("Local", error);
    }
  },
  /**
   * 根据前缀移除
   * @param key 缓存的Key
   */
  removeByPrefix(key) {
    try {
      for (const itemKey in storage.keys) {
        if (itemKey.indexOf(`${state.prefix}${key}`) !== -1) {
          storage.remove(itemKey);
        }
      }
    } catch (error) {
      consoleError("Local", error);
    }
  },
  /**
   * 移除全部
   */
  clear() {
    try {
      storage.clear();
    } catch (error) {
      consoleError("Local", error);
    }
  }
};
const Session = {
  /**
   * 设置会话缓存
   * @param key 缓存的Key
   * @param val 缓存值
   * @param expire 过期时间，单位分钟
   * @param encrypt 是否对缓存的数据加密
   */
  set(key, val, expire, encrypt) {
    if (typeof uni !== "undefined") {
      consoleError("Session", "UniApp 环境下 [Session] 不可用。");
      return;
    }
    try {
      encrypt ?? (encrypt = state.crypto);
      if (expire) {
        if (isNaN(expire) || expire < 1) {
          throw new Error("有效期应为一个有效数值");
        }
        const expireData = {
          time: Date.now(),
          expire
        };
        const expireJson = JSON.stringify(expireData);
        window.sessionStorage.setItem(`${state.prefix}${key}${state.expireSuffix}`, expireJson);
      }
      let valJson = JSON.stringify(val);
      if (encrypt) {
        valJson = base64Util.toBase64(valJson);
      }
      window.sessionStorage.setItem(`${state.prefix}${key}`, valJson);
    } catch (error) {
      consoleError("Session", error);
    }
  },
  /**
   * 获取会话缓存
   * @param key 缓存的Key
   * @param decrypt 是否对缓存的数据解密
   * @returns {T} 传入的对象类型，默认为 string
   */
  get(key, decrypt) {
    if (typeof uni !== "undefined") {
      consoleError("Session", "UniApp 环境下 [Session] 不可用。");
      return;
    }
    try {
      decrypt ?? (decrypt = state.crypto);
      let valJson = window.sessionStorage.getItem(`${state.prefix}${key}`);
      if (valJson) {
        if (decrypt) {
          valJson = base64Util.base64ToStr(valJson);
        }
        const expireJson = window.sessionStorage.getItem(`${state.prefix}${key}${state.expireSuffix}`);
        if (expireJson) {
          const expireData = JSON.parse(expireJson);
          if (Date.now() > expireData.time + expireData.expire * 60 * 1e3) {
            window.sessionStorage.removeItem(`${state.prefix}${key}`);
            window.sessionStorage.removeItem(`${state.prefix}${key}${state.expireSuffix}`);
            return null;
          }
        }
        try {
          return JSON.parse(valJson);
        } catch {
          return valJson;
        }
      }
      return null;
    } catch (error) {
      consoleError("Session", error);
    }
  },
  /**
   * 移除会话缓存
   * @param key 缓存的Key
   */
  remove(key) {
    if (typeof uni !== "undefined") {
      consoleError("Session", "UniApp 环境下 [Session] 不可用。");
      return;
    }
    try {
      window.sessionStorage.removeItem(`${state.prefix}${key}`);
      window.sessionStorage.removeItem(`${state.prefix}${key}${state.expireSuffix}`);
    } catch (error) {
      consoleError("Session", error);
    }
  },
  /**
   * 根据前缀移除会话缓存
   * @param key 缓存的Key
   */
  removeByPrefix(key) {
    if (typeof uni !== "undefined") {
      consoleError("Session", "UniApp 环境下 [Session] 不可用。");
      return;
    }
    try {
      for (const itemKey in window.sessionStorage) {
        if (itemKey.indexOf(`${state.prefix}${key}`) !== -1) {
          window.sessionStorage.removeItem(itemKey);
        }
      }
    } catch (error) {
      consoleError("Session", error);
    }
  },
  /**
   * 移除全部会话缓存
   */
  clear() {
    if (typeof uni !== "undefined") {
      consoleError("Session", "UniApp 环境下 [Session] 不可用。");
      return;
    }
    try {
      window.sessionStorage.clear();
    } catch (error) {
      consoleError("Session", error);
    }
  }
};
export {
  CACHE_EXPIRE_SUFFIX,
  CACHE_PREFIX,
  Local,
  Session,
  useStorage
};
//# sourceMappingURL=index.mjs.map
