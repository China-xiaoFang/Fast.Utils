import{consoleError as r}from"../console/index.mjs";const e=async(e,...n)=>{if(!e)return Promise.resolve(void 0);if("AsyncFunction"!==e.constructor.name)return new Promise((t,c)=>{try{return t(e(...n))}catch(o){return r("execFunction",o),c(o)}});try{return await e(...n)}catch(t){return r("execFunction",t),Promise.reject(t)}};export{e as execFunction};
//# sourceMappingURL=func.mjs.map
