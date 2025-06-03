import { isString, isNumber, isArray } from "lodash-unified";
import { consoleWarn } from "../console/index.mjs";
const isStringNumber = (val) => {
  if (!isString(val)) {
    return false;
  }
  return !Number.isNaN(Number(val));
};
const addUnit = (value, defaultUnit = "px") => {
  if (!value) return "";
  if (isNumber(value) || isStringNumber(value)) {
    return `${value}${defaultUnit}`;
  } else if (isString(value)) {
    return value;
  }
  consoleWarn("document", "binding value must be a string or number");
};
const styleToString = (styles) => {
  if (!styles) return "";
  if (isArray(styles)) {
    return styles.filter((item) => item && (item == null ? void 0 : item.length) > 0).map((item) => styleToString(item)).join(" ");
  } else if (isString(styles)) {
    return styles.trimEnd().endsWith(";") ? styles.trimEnd() : `${styles.trimEnd()};`;
  } else {
    return Object.entries(styles).filter(([_, value]) => value !== null && value !== "").map(([key, value]) => {
      const keyName = key.replace(/([A-Z])/g, "-$1").toLowerCase();
      return `${keyName}: ${value};`;
    }).join(" ");
  }
};
export {
  addUnit,
  styleToString
};
//# sourceMappingURL=style.mjs.map
