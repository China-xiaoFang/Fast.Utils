import { isNil, isString } from "lodash-unified";
import { FastError } from "../error/index.mjs";
const consoleLog = (name, message, error) => {
  if (error) {
    if (typeof uni !== "undefined") {
      console.log(`[Fast-Log-${name}]${message ? ` ${message}` : ""}`, error);
      console.log(`[Fast-Log-${name}]${message ? ` ${message}` : ""}`, error);
      console.log(error);
    } else {
      console.log(`[Fast-Log-${name}]${message ? ` ${message}` : ""}`, error);
    }
  } else {
    console.log(`[Fast-Log-${name}]${message ? ` ${message}` : ""}`);
  }
};
const consoleWarn = (name, message, error) => {
  if (error) {
    if (typeof uni !== "undefined") {
      console.warn(`[Fast-Log-${name}]${message ? ` ${message}` : ""}`, error);
      console.warn(`[Fast-Log-${name}]${message ? ` ${message}` : ""}`, error);
      console.warn(error);
    } else {
      console.warn(`[Fast-Log-${name}]${message ? ` ${message}` : ""}`, error);
    }
  } else {
    console.warn(`[Fast-Log-${name}]${message ? ` ${message}` : ""}`);
  }
};
const consoleDebug = (name, message, error) => {
  if (error) {
    if (typeof uni !== "undefined") {
      console.debug(`[Fast-Log-${name}]${message ? ` ${message}` : ""}`, error);
      console.debug(`[Fast-Log-${name}]${message ? ` ${message}` : ""}`, error);
      console.debug(error);
    } else {
      console.debug(`[Fast-Log-${name}]${message ? ` ${message}` : ""}`, error);
    }
  } else {
    console.debug(`[Fast-Log-${name}]${message ? ` ${message}` : ""}`);
  }
};
const consoleError = (name, message) => {
  if (isNil(message)) {
    return;
  }
  if (isString(message)) {
    console.error(new FastError(`[Fast-${name}] ${message}`));
  } else {
    if (typeof uni !== "undefined") {
      console.error(`[Fast-Error-${name}]`, message);
      console.error(`[Fast-Error-${name}]`);
      console.error(message);
    } else {
      console.error(`[Fast-Error-${name}]`, message);
    }
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
  throwError
};
//# sourceMappingURL=index.mjs.map
