"use strict";Object.defineProperty(exports,Symbol.toStringTag,{value:"Module"});const e=require("vue"),r=require("../error/index.js");exports.useRender=t=>{const n=e.getCurrentInstance();if(!n)throw new r.FastError("useRender must be called from inside a setup function");n.render=t};
//# sourceMappingURL=useRender.js.map
