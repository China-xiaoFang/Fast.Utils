let _debounceTimeout = null;
let _throttleRunning = false;
const clickUtil = {
  /**
   * 防抖
   * @param fn - 执行函数
   * @param delay - 延时毫秒
   * @returns 返回一个新的防抖函数
   */
  debounce(fn, delay = 500) {
    if (_debounceTimeout) {
      clearTimeout(_debounceTimeout);
    }
    _debounceTimeout = setTimeout(() => {
      fn();
    }, delay);
  },
  /**
   * 异步防抖
   * @param fn - 执行函数
   * @param delay - 延时毫秒
   * @returns 返回一个新的防抖函数
   */
  async debounceAsync(fn, delay = 500) {
    return new Promise((resolve, reject) => {
      if (_debounceTimeout) {
        clearTimeout(_debounceTimeout);
      }
      _debounceTimeout = setTimeout(async () => {
        try {
          await fn();
          resolve();
        } catch (error) {
          reject(error);
        }
      }, delay);
    });
  },
  /**
   * 节流
   * @param fn - 执行函数
   * @param delay - 延时毫秒
   * @returns 返回一个新的节流函数
   */
  throttle(fn, delay = 500) {
    if (_throttleRunning) {
      return;
    }
    _throttleRunning = true;
    fn();
    setTimeout(() => {
      _throttleRunning = false;
    }, delay);
  },
  /**
   * 异步节流
   * @param fn - 执行函数
   * @param delay - 延时毫秒
   * @returns 返回一个新的节流函数
   */
  async throttleAsync(fn, delay = 500) {
    return new Promise((resolve, reject) => {
      if (_throttleRunning) {
        return;
      }
      _throttleRunning = true;
      fn().then(() => {
        resolve();
      }).catch((error) => {
        reject(error);
      }).finally(() => {
        setTimeout(() => {
          _throttleRunning = false;
        }, delay);
      });
    });
  }
};
export {
  clickUtil
};
//# sourceMappingURL=index.mjs.map
