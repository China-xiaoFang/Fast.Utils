const dateUtil = {
  /**
   * 根据当前时间生成问候语
   */
  getGreet() {
    const now = /* @__PURE__ */ new Date();
    const hour = now.getHours();
    let greet = "";
    if (hour < 5) {
      greet = "夜深了，注意身体哦！";
    } else if (hour < 9) {
      greet = "早上好！欢迎回来！";
    } else if (hour < 12) {
      greet = "上午好！欢迎回来！";
    } else if (hour < 14) {
      greet = "中午好！欢迎回来！";
    } else if (hour < 18) {
      greet = "下午好！欢迎回来！";
    } else if (hour < 24) {
      greet = "晚上好！欢迎回来！";
    } else {
      greet = "您好！欢迎回来！";
    }
    return greet;
  },
  /**
   * 时间处理翻译
   */
  dateTimeFix(date) {
    if (date !== null && date !== void 0 && date) {
      if (typeof date === "string") {
        date = new Date(date);
      }
      let timestamp = date.getTime();
      if (timestamp.toString().length < 13) {
        const arrTimestamp = timestamp.toString().split("");
        for (let start = 0; start < 13; start++) {
          if (!arrTimestamp[start]) {
            arrTimestamp[start] = "0";
          }
        }
        timestamp = parseInt(arrTimestamp.join(""));
      }
      const minute = 1e3 * 60;
      const hour = minute * 60;
      const day = hour * 24;
      const month = day * 30;
      const curTime = (/* @__PURE__ */ new Date()).getTime();
      const diffValue = curTime - timestamp;
      const monthC = diffValue / month;
      const weekC = diffValue / (7 * day);
      const dayC = diffValue / day;
      const hourC = diffValue / hour;
      const minC = diffValue / minute;
      if (diffValue < 0) {
        const monthC1 = Math.abs(monthC);
        const weekC1 = Math.abs(weekC);
        const dayC1 = Math.abs(dayC);
        const hourC1 = Math.abs(hourC);
        const minC1 = Math.abs(minC);
        if (monthC1 > 12) {
          return `${parseInt(`${monthC1 / 12}`)}年后`;
        } else if (monthC1 >= 6) {
          return "半年后";
        } else if (monthC1 >= 1) {
          return `${parseInt(`${monthC1}`)}月后`;
        } else if (weekC1 > 2) {
          return "半月后";
        } else if (weekC1 >= 1) {
          return `${parseInt(`${weekC1}`)}周后`;
        } else if (dayC1 >= 1) {
          return `${parseInt(`${dayC1}`)}天后`;
        } else if (hourC1 >= 1) {
          return `${parseInt(`${hourC1}`)}小时后`;
        } else if (minC1 >= 1) {
          return `${parseInt(`${minC1}`)}分钟后`;
        }
        return "刚刚";
      }
      if (monthC > 12) {
        return `${parseInt(`${monthC / 12}`)}年前`;
      } else if (monthC >= 6) {
        return "半年前";
      } else if (monthC >= 1) {
        return `${parseInt(`${monthC}`)}月前`;
      } else if (weekC > 2) {
        return "半月前";
      } else if (weekC >= 1) {
        return `${parseInt(`${weekC}`)}周前`;
      } else if (dayC >= 1) {
        return `${parseInt(`${dayC}`)}天前`;
      } else if (hourC >= 1) {
        return `${parseInt(`${hourC}`)}小时前`;
      } else if (minC >= 1) {
        return `${parseInt(`${minC}`)}分钟前`;
      }
      return "刚刚";
    } else {
      return "";
    }
  },
  getDefaultTime() {
    const end = /* @__PURE__ */ new Date();
    const start = /* @__PURE__ */ new Date();
    start.setMonth(start.getMonth() - 1);
    start.setHours(0, 0, 0);
    end.setHours(23, 59, 59);
    return [start, end];
  },
  getSimpleTime() {
    const start = /* @__PURE__ */ new Date();
    start.setHours(0, 0, 0);
    return start;
  },
  getSimpleShortcuts() {
    return [
      {
        text: "今天",
        value: () => {
          const date = /* @__PURE__ */ new Date();
          date.setHours(0, 0, 0);
          return date;
        }
      },
      {
        text: "昨天",
        value: () => {
          const date = /* @__PURE__ */ new Date();
          date.setDate(date.getDate() - 1);
          date.setHours(0, 0, 0);
          return date;
        }
      },
      {
        text: "一周前",
        value: () => {
          const date = /* @__PURE__ */ new Date();
          date.setDate(date.getDate() - 7);
          date.setHours(0, 0, 0);
          return date;
        }
      },
      {
        text: "一月前",
        value: () => {
          const date = /* @__PURE__ */ new Date();
          date.setMonth(date.getMonth() - 1);
          date.setHours(0, 0, 0);
          return date;
        }
      },
      {
        text: "一年前",
        value: () => {
          const date = /* @__PURE__ */ new Date();
          date.setFullYear(date.getFullYear() - 1);
          date.setHours(0, 0, 0);
          return date;
        }
      }
    ];
  },
  getShortcuts() {
    return [
      {
        text: "近1天",
        value: () => {
          const end = /* @__PURE__ */ new Date();
          const start = /* @__PURE__ */ new Date();
          start.setDate(start.getDate() - 1);
          start.setHours(0, 0, 0);
          end.setHours(23, 59, 59);
          return [start, end];
        }
      },
      {
        text: "近3天",
        value: () => {
          const end = /* @__PURE__ */ new Date();
          const start = /* @__PURE__ */ new Date();
          start.setDate(start.getDate() - 3);
          start.setHours(0, 0, 0);
          end.setHours(23, 59, 59);
          return [start, end];
        }
      },
      {
        text: "近1周",
        value: () => {
          const end = /* @__PURE__ */ new Date();
          const start = /* @__PURE__ */ new Date();
          start.setDate(start.getDate() - 7);
          start.setHours(0, 0, 0);
          end.setHours(23, 59, 59);
          return [start, end];
        }
      },
      {
        text: "近1月",
        value: () => {
          const end = /* @__PURE__ */ new Date();
          const start = /* @__PURE__ */ new Date();
          start.setMonth(start.getMonth() - 1);
          start.setHours(0, 0, 0);
          end.setHours(23, 59, 59);
          return [start, end];
        }
      },
      {
        text: "近3月",
        value: () => {
          const end = /* @__PURE__ */ new Date();
          const start = /* @__PURE__ */ new Date();
          start.setMonth(start.getMonth() - 3);
          start.setHours(0, 0, 0);
          end.setHours(23, 59, 59);
          return [start, end];
        }
      },
      {
        text: "近6月",
        value: () => {
          const end = /* @__PURE__ */ new Date();
          const start = /* @__PURE__ */ new Date();
          start.setMonth(start.getMonth() - 6);
          start.setHours(0, 0, 0);
          end.setHours(23, 59, 59);
          return [start, end];
        }
      },
      {
        text: "近1年",
        value: () => {
          const end = /* @__PURE__ */ new Date();
          const start = /* @__PURE__ */ new Date();
          start.setFullYear(start.getFullYear() - 1);
          start.setHours(0, 0, 0);
          end.setHours(23, 59, 59);
          return [start, end];
        }
      }
    ];
  },
  getDisabledDate(time) {
    return time.getTime() > Date.now();
  }
};
export {
  dateUtil
};
//# sourceMappingURL=index.mjs.map
