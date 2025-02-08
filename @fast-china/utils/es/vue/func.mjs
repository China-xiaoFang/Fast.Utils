import { consoleError } from "../console/index.mjs";
const execFunction = async (fn, ...args) => {
  if (!fn) return Promise.resolve(void 0);
  if (fn.constructor.name === "AsyncFunction") {
    try {
      return await fn(...args);
    } catch (error) {
      consoleError("execFunction", error);
      return Promise.reject(error);
    }
  } else {
    return new Promise((resolve, reject) => {
      try {
        const res = fn(...args);
        return resolve(res);
      } catch (error) {
        consoleError("execFunction", error);
        return reject(error);
      }
    });
  }
};
export {
  execFunction
};
//# sourceMappingURL=func.mjs.map
