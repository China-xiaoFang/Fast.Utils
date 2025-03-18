import { reactive } from "vue";
import { Local } from "../storage/index.mjs";
import { stringUtil } from "../string/index.mjs";
const state = reactive({
  cacheKey: "__DEVICE_ID",
  deviceId: ""
});
const uuidRegExp = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const makeIdentity = (deviceID) => {
  deviceID ?? (deviceID = state.deviceId);
  if (deviceID && uuidRegExp.test(deviceID)) {
    Local.set(state.cacheKey, deviceID);
    state.deviceId = deviceID;
    return state.deviceId;
  }
  deviceID = Local.get(state.cacheKey);
  if (deviceID && uuidRegExp.test(deviceID)) {
    state.deviceId = deviceID;
    return deviceID;
  }
  deviceID = stringUtil.generateUUID();
  Local.set(state.cacheKey, deviceID);
  state.deviceId = deviceID;
  return deviceID;
};
const useIdentity = () => {
  return {
    ...state,
    makeIdentity
  };
};
export {
  useIdentity
};
//# sourceMappingURL=index.mjs.map
