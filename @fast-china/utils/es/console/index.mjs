import { reactive } from "vue";
import { isNil, isString } from "lodash-unified";
import { FastError } from "../error/index.mjs";
const state = reactive({
  /** @description Uni-App 在 APP-PLUS 下是否拆分输出 @default false */
  uniAppPlusSplit: false
});
const useConsole = () => {
  return {
    /**
     * 设置 Uni-App 在 APP-PLUS 下是否拆分输出
     */
    setUniAppPlusSplit(value) {
      state.uniAppPlusSplit = value;
    }
  };
};
const vConsole = (level, ...args) => {
  if (state.uniAppPlusSplit) {
    if (typeof uni !== "undefined") {
      if (typeof plus !== "undefined") {
        args.forEach((item) => {
          if (isNil(item)) return;
          console[level.toLowerCase()](isString(item) ? item : JSON.stringify(item, null, 2));
        });
        return;
      }
    }
  }
  console[level.toLowerCase()](...args);
};
const makeConsole = (level) => {
  return (name, message, error) => {
    const prefix = `[Fast-${level}-${name}]`;
    if (error) {
      vConsole(level, `${prefix}${message ? ` ${message}` : ""}`, error);
    } else {
      vConsole(level, `${prefix}${message ? ` ${message}` : ""}`);
    }
  };
};
const consoleLog = makeConsole("Log");
const consoleWarn = makeConsole("Warn");
const consoleDebug = makeConsole("Debug");
const consoleError = (name, message) => {
  if (isNil(message)) {
    return;
  }
  if (isString(message)) {
    console.error(new FastError(`[Fast-${name}] ${message}`));
  } else {
    vConsole("Error", `[Fast-Error-${name}]`, message);
  }
};
const throwError = (name, message) => {
  throw new FastError(`[Fast-${name}] ${message}`);
};
export {
  consoleDebug,
  consoleError,
  consoleLog,
  consoleWarn,
  throwError,
  useConsole
};
//# sourceMappingURL=index.mjs.map
