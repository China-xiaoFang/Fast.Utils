const t=()=>{},e=(t,e)=>{if(t.install=n=>{for(const o of[t,...Object.values(e??{})])n.component(o.name,o)},e)for(const[n,o]of Object.entries(e))t[n]=o;return t},n=e=>(e.install=t,e),o=(t,e)=>(t.install=n=>{n.directive(e,t)},t);export{e as withInstall,o as withInstallDirective,n as withNoopInstall};
//# sourceMappingURL=install.mjs.map
