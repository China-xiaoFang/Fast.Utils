const envUtil = {
  /**
   * 是否为 Uni 环境
   * @returns
   */
  isUni() {
    return typeof uni !== "undefined";
  },
  /**
   * 是否为 Web 环境（浏览器环境）
   * @returns
   */
  isWeb() {
    return typeof window !== "undefined" && typeof window.document !== "undefined";
  },
  /**
   * 是否为手机设备
   * @returns
   */
  isMobile() {
    if (!this.isWeb()) return false;
    const ua = navigator.userAgent || "";
    return /Mobile|iPhone|Android.*Mobile|Windows Phone/i.test(ua);
  },
  /**
   * 是否为平板设备
   * @returns
   */
  isIpad() {
    if (!this.isWeb()) return false;
    const ua = navigator.userAgent || "";
    return /iPad|Android(?!.*Mobile)|Tablet/i.test(ua);
  }
};
export {
  envUtil
};
//# sourceMappingURL=index.mjs.map
