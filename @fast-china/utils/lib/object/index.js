"use strict";Object.defineProperty(exports,Symbol.toStringTag,{value:"Module"});const e=require("lodash-unified"),t=require("../string/index.js"),n={objectToQueryString(e){let t="";for(const n in e)Object.prototype.hasOwnProperty.call(e,n)&&(""!==t&&(t+="&"),t+=`${encodeURIComponent(n)}=${encodeURIComponent(e[n])}`);return t},objectToStyle:o=>e.isArray(o)?o.filter((function(e){return null!=e&&""!==e})).map((function(e){return n.objectToStyle(e)})).join(";"):e.isString(o)?o:e.isObject(o)?Object.keys(o).filter((function(e){return null!=o[e]&&""!==o[e]})).map((function(e){return[t.stringUtil.toCamelCase(e),o[e]].join(":")})).join(";"):""};exports.objectUtil=n;
//# sourceMappingURL=index.js.map
