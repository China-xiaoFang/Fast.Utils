"use strict";Object.defineProperty(exports,Symbol.toStringTag,{value:"Module"});const e={hasDuplicateProperty(e,t){const r=e.map((e=>e[t])),o=new Set(r);return r.length!==o.size},hasDifferentProperty(e,t){const r=new Set;for(const o of e)if(r.add(o[t]),r.size>1)return!0;return!1}};exports.arrayUtil=e;
//# sourceMappingURL=index.js.map
