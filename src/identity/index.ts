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
 * @param deviceID 覆盖的设备Id
 * @returns
 */
const makeIdentity = (deviceID?: string): string => {
	deviceID ??= state.deviceId;
	// 判断是否存在
	if (deviceID && uuidRegExp.test(deviceID)) {
		Local.set(state.cacheKey, deviceID);
		state.deviceId = deviceID;
		return state.deviceId;
	}
	// 生成浏览器唯一 UUID
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

export const useIdentity = (): typeof state & { makeIdentity: () => string } => {
	return {
		...state,
		makeIdentity,
	};
};
