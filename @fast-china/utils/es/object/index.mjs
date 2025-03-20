import { isArray, isString, isObject } from "lodash-unified";
import { stringUtil } from "../string/index.mjs";
const objectUtil = {
  /**
   * 对象URL参数化
   */
  objectToQueryString(obj) {
    let params = "";
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        if (params !== "") {
          params += "&";
        }
        params += `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`;
      }
    }
    return params;
  },
  /**
   * 将外部传入的样式格式化成可读的 CSS 样式。
   */
  objectToStyle(styles) {
    if (isArray(styles)) {
      return styles.filter(function(item) {
        return item != null && item !== "";
      }).map(function(item) {
        return objectUtil.objectToStyle(item);
      }).join(";");
    }
    if (isString(styles)) {
      return styles;
    }
    if (isObject(styles)) {
      return Object.keys(styles).filter(function(key) {
        return styles[key] != null && styles[key] !== "";
      }).map(function(key) {
        return [stringUtil.toCamelCase(key), styles[key]].join(":");
      }).join(";");
    }
    return "";
  }
};
export {
  objectUtil
};
//# sourceMappingURL=index.mjs.map
