/** 延迟访问 Encoding API 时使用的平台全局对象最小视图。 */
interface RuntimeEncodingGlobals {
	/** 可选 TextDecoder 构造器；缺失时只允许不依赖文本解码的 API 继续工作。 */
	TextDecoder?: typeof TextDecoder;
	/** 可选 TextEncoder 构造器；缺失时只允许纯字节 API 继续工作。 */
	TextEncoder?: typeof TextEncoder;
}

const runtimeEncodingGlobals = globalThis as unknown as RuntimeEncodingGlobals;

/**
 * 延迟解析 UTF-8 TextDecoder，确保模块导入阶段不依赖 Encoding API。
 *
 * @returns 启用 Fatal 模式的新解码器，非法 UTF-8 会直接失败。
 * @throws `Error` 当当前平台没有提供 `TextDecoder`。
 */
export const getTextDecoder = (): TextDecoder => {
	const TextDecoderConstructor = runtimeEncodingGlobals.TextDecoder;
	if (typeof TextDecoderConstructor !== "function") {
		throw new Error("TextDecoder is unavailable in the current runtime.");
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
	const TextEncoderConstructor = runtimeEncodingGlobals.TextEncoder;
	if (typeof TextEncoderConstructor !== "function") {
		throw new Error("TextEncoder is unavailable in the current runtime.");
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
