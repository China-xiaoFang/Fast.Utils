const arrayUtil = {
  /**
   * 是否存在重复值
   * @param arr 数组
   * @param prop 属性
   * @returns
   */
  hasDuplicateProperty(arr, prop) {
    if (Array.isArray(prop)) {
      const seen = /* @__PURE__ */ new Set();
      for (const obj of arr) {
        const key = JSON.stringify(prop.map((p) => obj[p]));
        if (seen.has(key)) return true;
        seen.add(key);
      }
      return false;
    } else {
      const seen = /* @__PURE__ */ new Set();
      for (const obj of arr) {
        const value = obj[prop];
        if (seen.has(value)) return true;
        seen.add(value);
      }
      return false;
    }
  },
  /**
   * 是否存在非重复值
   * @param arr 数组
   * @param prop 属性
   * @returns
   */
  hasDifferentProperty(arr, prop) {
    if (arr.length <= 1) return false;
    if (Array.isArray(prop)) {
      const firstKey = JSON.stringify(prop.map((p) => arr[0][p]));
      for (let i = 1; i < arr.length; i++) {
        const currentKey = JSON.stringify(prop.map((p) => arr[i][p]));
        if (currentKey !== firstKey) return true;
      }
    } else {
      const firstValue = arr[0][prop];
      for (let i = 1; i < arr.length; i++) {
        if (arr[i][prop] !== firstValue) return true;
      }
    }
    return false;
  }
};
export {
  arrayUtil
};
//# sourceMappingURL=index.mjs.map
