/**
 * 延迟解析 UTF-8 TextDecoder，确保模块导入阶段不依赖 Encoding API。
 *
 * @returns 启用 Fatal 模式的新解码器，非法 UTF-8 会直接失败。
 * @throws `Error` 当当前平台没有提供 `TextDecoder`。
 */
export const getTextDecoder = (): TextDecoder => {
	const TextDecoderConstructor = globalThis.TextDecoder;
	if (typeof TextDecoderConstructor !== "function") {
		throw new Error("当前运行环境不支持 TextDecoder。");
	}
	return new TextDecoderConstructor("utf-8", { fatal: true });
};

/**
 * 延迟解析 TextEncoder，让纯字节 API 在缺少 Encoding API 的平台仍可导入。
 *
 * @returns 新建的 UTF-8 编码器。
 * @throws `Error` 当当前平台没有提供 `TextEncoder`。
 */
export const getTextEncoder = (): TextEncoder => {
	const TextEncoderConstructor = globalThis.TextEncoder;
	if (typeof TextEncoderConstructor !== "function") {
		throw new Error("当前运行环境不支持 TextEncoder。");
	}
	return new TextEncoderConstructor();
};

/**
 * 在确认平台能力后把 JavaScript 字符串编码为 UTF-8。
 *
 * @param value - 待编码文本。
 * @returns 使用独立 ArrayBuffer 的 UTF-8 字节数组。
 * @throws `Error` 当当前平台没有提供 `TextEncoder`。
 */
export const encodeUtf8 = (value: string): Uint8Array<ArrayBuffer> => getTextEncoder().encode(value);

/** 解码或解密后的字符串扩展。 */
interface DecodedTextExtension {
	/**
	 * 显式把原始文本解析为 JSON 值。
	 *
	 * @remarks 泛型只描述调用方期望的类型，不验证实际 JSON 结构；不可信数据仍需执行运行时校验。
	 * @returns `JSON.parse` 生成的对象、数组、标量或 `null`。
	 * @throws `TypeError` 当原始文本不是合法 JSON。
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- 未传泛型时按公共 API 约定保留 JSON.parse 的 any 返回类型。
	parseJson: <Value = any>() => Value;
}

/** 可直接作为原始字符串使用，并支持显式 JSON 解析的解码或解密结果。 */
export type DecodedText = string & DecodedTextExtension;

const parseJsonMarker = Symbol.for("@fast-china/utils/parse-json");

/** 把当前字符串解析为 JSON 值。 */
const parseJson = function <Value = ReturnType<typeof JSON.parse>>(this: string): Value {
	try {
		return JSON.parse(String(this)) as Value;
	} catch (cause) {
		throw new TypeError("解码后的文本不是有效的 JSON。", { cause });
	}
};

Object.defineProperty(parseJson, parseJsonMarker, { value: true });

/** 按需安装不可枚举的字符串 JSON 解析扩展。 */
const ensureParseJsonExtension = (): void => {
	const descriptor = Object.getOwnPropertyDescriptor(String.prototype, "parseJson");
	if (descriptor !== undefined) {
		if (typeof descriptor.value === "function" && Reflect.get(descriptor.value, parseJsonMarker) === true) return;
		throw new TypeError("String.prototype.parseJson 已被其他实现占用。");
	}

	try {
		Object.defineProperty(String.prototype, "parseJson", {
			configurable: true,
			enumerable: false,
			value: parseJson,
			writable: true,
		});
	} catch (cause) {
		throw new TypeError("当前运行环境不允许安装 String.prototype.parseJson。", { cause });
	}
};

/**
 * 创建可链式解析 JSON 的原始字符串。
 *
 * @param text - 解码或解密后的原始文本。
 * @returns 可直接作为字符串使用或显式调用 `.parseJson<Value>()` 的结果。
 */
export const createDecodedText = (text: string): DecodedText => {
	ensureParseJsonExtension();
	return text as DecodedText;
};
