"use strict";Object.defineProperty(exports,Symbol.toStringTag,{value:"Module"});const e=require("vue"),t=require("lodash-unified");exports.definePropType=e=>e,exports.useProps=(o,r,s)=>o?e.computed((()=>{const e=r?t.omit(r,s??[]):{};return t.pick(o,Object.keys(e))})):e.computed((()=>({})));
//# sourceMappingURL=props.js.map
