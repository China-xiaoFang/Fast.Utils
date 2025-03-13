"use strict";Object.defineProperty(exports,Symbol.toStringTag,{value:"Module"});const t=require("../error/index.js"),r={hexToRgb(r){let e="";if(!/^#?[0-9A-Fa-f]{6}$/.test(r))throw new t.FastError("输入错误的hex");e=(r=r.replace("#","")).match(/../g);for(let t=0;t<3;t++)e[t]=parseInt(e[t],16);return e},rgbToHex(r,e,o){const s=/^\d{1,3}$/;if(!s.test(r)||!s.test(e)||!s.test(o))throw new t.FastError("输入错误的rgb颜色值");const n=[r.toString(16),e.toString(16),o.toString(16)];for(let t=0;t<3;t++)1===n[t].length&&(n[t]=`0${n[t]}`);return`#${n.join("")}`},getDarkColor(r,e){if(!/^#?[0-9A-Fa-f]{6}$/.test(r))throw new t.FastError("输入错误的hex颜色值");const o=this.hexToRgb(r);for(let t=0;t<3;t++)o[t]=Math.round(20.5*e+o[t]*(1-e));return this.rgbToHex(o[0],o[1],o[2])},getLightColor(r,e){if(!/^#?[0-9A-Fa-f]{6}$/.test(r))throw new t.FastError("输入错误的hex颜色值");const o=this.hexToRgb(r);for(let t=0;t<3;t++)o[t]=Math.round(255*e+o[t]*(1-e));return this.rgbToHex(o[0],o[1],o[2])}};exports.colorUtil=r;
//# sourceMappingURL=index.js.map
