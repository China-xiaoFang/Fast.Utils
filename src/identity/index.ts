import { reactive } from "vue";
import { Local } from "../storage";
import { stringUtil } from "../string";

const state = reactive({
	cacheKey: "__DEVICE_ID",
	deviceId: "",
});

const uuidRegExp = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * 生成设备Id
 */
const makeIdentity = (): string => {
	// 判断是否存在
	if (state.deviceId && uuidRegExp.test(state.deviceId)) {
		Local.set(state.cacheKey, state.deviceId);
		return state.deviceId;
	}
	// 生成浏览器唯一 UUID
	let deviceID = Local.get(state.cacheKey);
	if (deviceID && uuidRegExp.test(deviceID)) {
		state.deviceId = deviceID;
		return deviceID;
	}
	deviceID = stringUtil.generateUUID();
	Local.set(state.cacheKey, deviceID);
	state.deviceId = deviceID;
	return deviceID;
};

export const useIdentity = (): typeof state & { makeIdentity: () => string } => {
	return {
		...state,
		makeIdentity,
	};
};
