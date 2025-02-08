"use strict";Object.defineProperty(exports,Symbol.toStringTag,{value:"Module"});const e=require("lodash-unified"),r=require("../console/index.js");exports.addUnit=(i,n="px")=>{return i?e.isNumber(i)||(t=i,e.isString(t)&&!Number.isNaN(Number(t)))?`${i}${n}`:e.isString(i)?i:void r.consoleWarn("document","binding value must be a string or number"):"";var t};
//# sourceMappingURL=style.js.map
