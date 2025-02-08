let _debounceTimeout: ReturnType<typeof setTimeout> | null = null;
let _throttleRunning = false;

export const clickUtil = {
	/**
	 * 防抖
	 * @param fn - 执行函数
	 * @param delay - 延时毫秒
	 * @returns 返回一个新的防抖函数
	 */
	debounce(fn: () => void, delay = 500): void {
		// 如果已有定时器，清除它
		if (_debounceTimeout) {
			clearTimeout(_debounceTimeout);
		}
		// 设置新的定时器
		_debounceTimeout = setTimeout(() => {
			// 调用原函数
			fn();
		}, delay);
	},
	/**
	 * 异步防抖
	 * @param fn - 执行函数
	 * @param delay - 延时毫秒
	 * @returns 返回一个新的防抖函数
	 */
	async debounceAsync(fn: () => Promise<void>, delay = 500): Promise<void> {
		return new Promise((resolve, reject) => {
			// 清除已有定时器
			if (_debounceTimeout) {
				clearTimeout(_debounceTimeout);
			}
			// 设置新的定时器
			_debounceTimeout = setTimeout(async () => {
				try {
					// 调用异步函数 fn
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
	throttle(fn: () => void, delay = 500): void {
		// 如果节流操作正在运行，直接返回
		if (_throttleRunning) {
			return;
		}
		// 设置节流状态为运行
		_throttleRunning = true;
		// 调用原函数
		fn();
		// 设置定时器以重置节流状态
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
	async throttleAsync(fn: () => Promise<void>, delay = 500): Promise<void> {
		return new Promise((resolve, reject) => {
			// 如果节流操作正在进行，直接返回
			if (_throttleRunning) {
				return;
			}
			// 设置节流状态为运行
			_throttleRunning = true;
			// 调用原函数
			fn()
				.then(() => {
					resolve();
				})
				.catch((error) => {
					reject(error);
				})
				.finally(() => {
					// 设置定时器以重置节流状态
					setTimeout(() => {
						_throttleRunning = false;
					}, delay);
				});
		});
	},
};
