import { getCurrentInstance } from "vue";
const useRender = (render) => {
  const vm = getCurrentInstance();
  if (!vm) {
    throw new Error("useRender must be called from inside a setup function");
  }
  vm.render = render;
};
export {
  useRender
};
//# sourceMappingURL=useRender.mjs.map
