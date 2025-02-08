import { isString, isNumber } from "lodash-unified";
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
export {
  addUnit
};
//# sourceMappingURL=style.mjs.map
