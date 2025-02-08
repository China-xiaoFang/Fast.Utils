import { computed } from "vue";
import { omit, pick } from "lodash-unified";
const definePropType = (val) => val;
const useProps = (props, rawProps, ignoreRawProps) => {
  if (!props) return computed(() => ({}));
  return computed(() => {
    const omittedRawProps = rawProps ? omit(rawProps, ignoreRawProps ?? []) : {};
    return pick(props, Object.keys(omittedRawProps));
  });
};
export {
  definePropType,
  useProps
};
//# sourceMappingURL=props.mjs.map
