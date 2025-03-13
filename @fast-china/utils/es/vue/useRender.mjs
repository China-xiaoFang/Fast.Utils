import { getCurrentInstance } from "vue";
import { FastError } from "../error/index.mjs";
const useRender = (render) => {
  const vm = getCurrentInstance();
  if (!vm) {
    throw new FastError("useRender must be called from inside a setup function");
  }
  vm.render = render;
};
export {
  useRender
};
//# sourceMappingURL=useRender.mjs.map
