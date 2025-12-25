import{computed as e}from"vue";import{omit as o}from"lodash-unified";const r=(r,t,i)=>e(r?()=>{const e=r?o(r,i??[]):{};return Object.keys(e).reduce((e,o)=>(e[`on${o.split("-").map((e,o)=>e.charAt(0).toUpperCase()+e.slice(1)).join("")}`]=(...e)=>t(o,...e),e),{})}:()=>({}));export{r as useEmits};
//# sourceMappingURL=emits.mjs.map
