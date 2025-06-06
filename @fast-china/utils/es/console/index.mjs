import { isString, isNil } from "lodash-unified";
import { FastError } from "../error/index.mjs";
const consoleLog = (name, message, error) => {
  if (error) {
    if (typeof uni !== "undefined") {
      if (typeof plus !== "undefined") {
        console.log(`[Fast-Log-${name}]${message ? ` ${message}` : ""}`);
        console.log(isString(error) ? error : JSON.stringify(error, null, 2));
      } else {
        console.log(`[Fast-Log-${name}]${message ? ` ${message}` : ""}`, error);
      }
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
      if (typeof plus !== "undefined") {
        console.warn(`[Fast-Log-${name}]${message ? ` ${message}` : ""}`);
        console.warn(isString(error) ? error : JSON.stringify(error, null, 2));
      } else {
        console.warn(`[Fast-Log-${name}]${message ? ` ${message}` : ""}`, error);
      }
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
      if (typeof plus !== "undefined") {
        console.debug(`[Fast-Log-${name}]${message ? ` ${message}` : ""}`);
        console.debug(isString(error) ? error : JSON.stringify(error, null, 2));
      } else {
        console.debug(`[Fast-Log-${name}]${message ? ` ${message}` : ""}`, error);
      }
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
      if (typeof plus !== "undefined") {
        console.error(`[Fast-Error-${name}]`);
        console.error(JSON.stringify(message, null, 2));
      } else {
        console.error(`[Fast-Error-${name}]`, message);
      }
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
