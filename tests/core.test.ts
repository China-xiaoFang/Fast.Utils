import { afterEach, describe, it } from "node:test";
import {
	addCssUnit,
	addDays,
	addMonths,
	addYears,
	allEqualBy,
	average,
	camelCase,
	chunk,
	clamp,
	contrastRatio,
	copy,
	createDateRangeShortcuts,
	createDateShortcuts,
	createOneMonthRangeFromToday,
	decodeBase64,
	decodeBase64Bytes,
	decodeBase64Url,
	decodeLatin1Base64,
	decodeSecureBase64,
	decodeURIComponentRepeatedly,
	detectRuntime,
	difference,
	encodeBase64,
	encodeBase64Bytes,
	encodeBase64Url,
	encodeLatin1Base64,
	encodeSecureBase64,
	endOfDay,
	escapeHtml,
	formatBytes,
	formatChineseRelativeTime,
	formatHexColor,
	formatRelativeTime,
	generateUuidV4,
	getLocalDayBounds,
	getLocalTimeGreeting,
	getStartOfToday,
	groupBy,
	hasDuplicatesBy,
	hasOwn,
	hasWebCrypto,
	inRange,
	intersection,
	isDateAfterNow,
	isFuture,
	isMobileUserAgent,
	isPlainObject,
	isSameDay,
	isTabletUserAgent,
	isUuidV4,
	isValidDate,
	isValidJson,
	isWithinInterval,
	kebabCase,
	lerp,
	mapValues,
	mixHexColorWithBlack,
	mixHexColorWithWhite,
	normalizeWhitespace,
	omit,
	parseHexColor,
	parseQueryString,
	partition,
	pascalCase,
	pick,
	pickHigherContrastColor,
	randomInt,
	randomString,
	relativeLuminance,
	removeNullishValues,
	roundTo,
	serializeStyle,
	shallowEqual,
	splitWords,
	startOfDay,
	sum,
	toDate,
	toQueryString,
	truncateGraphemes,
	unique,
	uniqueBy,
} from "../src/index";
import { configureLogger, createLogger, logger as defaultLogger } from "../src/logger/index";
import { expect, vi } from "./test-helpers";

const legacyBase64Dictionary = [
	{ index: 977, randomIndex: 188 },
	{ index: 926, randomIndex: 201 },
	{ index: 851, randomIndex: 225 },
	{ index: 700, randomIndex: 255 },
	{ index: 600, randomIndex: 268 },
	{ index: 500, randomIndex: 277 },
	{ index: 400, randomIndex: 288 },
	{ index: 330, randomIndex: 327 },
	{ index: 300, randomIndex: 180 },
	{ index: 200, randomIndex: 178 },
	{ index: 100, randomIndex: 124 },
	{ index: 98, randomIndex: 95 },
	{ index: 92, randomIndex: 90 },
	{ index: 91, randomIndex: 87 },
	{ index: 88, randomIndex: 84 },
	{ index: 82, randomIndex: 79 },
	{ index: 78, randomIndex: 71 },
	{ index: 72, randomIndex: 69 },
	{ index: 68, randomIndex: 66 },
	{ index: 59, randomIndex: 55 },
	{ index: 48, randomIndex: 43 },
	{ index: 42, randomIndex: 37 },
	{ index: 36, randomIndex: 30 },
	{ index: 33, randomIndex: 27 },
	{ index: 24, randomIndex: 20 },
	{ index: 23, randomIndex: 18 },
	{ index: 21, randomIndex: 16 },
	{ index: 17, randomIndex: 14 },
	{ index: 13, randomIndex: 9 },
	{ index: 7, randomIndex: 4 },
	{ index: 5, randomIndex: 3 },
	{ index: 2, randomIndex: 1 },
] as const;

/** 复现旧版默认前缀和字典插入流程，作为持久化兼容格式基准。 */
const encodeLegacySecureBase64 = (value: string): string => {
	const source = Buffer.from(encodeURIComponent(value), "latin1").toString("base64");
	let result = source;
	for (const item of legacyBase64Dictionary) {
		if (item.index >= source.length) continue;
		const character = source[item.randomIndex];
		if (character === undefined) throw new Error("Invalid legacy Base64 fixture.");
		result = result.slice(0, item.index) + character + result.slice(item.index);
	}
	return `BBBBBB${result}`;
};

/** 使用旧版删除顺序解码，确认修复后的边界载荷仍可被已有消费者读取。 */
const decodeLegacySecureBase64 = (value: string): string => {
	const source = value.slice(6);
	let result = source;
	for (const item of [...legacyBase64Dictionary].reverse()) {
		if (item.index < source.length) result = result.slice(0, item.index) + result.slice(item.index + 1);
	}
	return decodeURIComponent(Buffer.from(result, "base64").toString("latin1"));
};

afterEach(() => {
	vi.unstubAllGlobals();
});

describe("array utilities", () => {
	it("chunks, removes nullish values, and deduplicates without mutating input", () => {
		const input = [1, 2, 2, 3] as const;
		expect(chunk(input, 3)).toEqual([[1, 2, 2], [3]]);
		expect(removeNullishValues([0, null, false, undefined, ""])).toEqual([0, false, ""]);
		expect(unique(input)).toEqual([1, 2, 3]);
		expect(input).toEqual([1, 2, 2, 3]);
		expect(() => chunk(input, 0)).toThrow(RangeError);
	});

	it("supports keyed uniqueness, grouping, and partitioning", () => {
		const values = [
			{ group: "a", id: 1 },
			{ group: "a", id: 1 },
			{ group: "b", id: 2 },
		];
		expect(uniqueBy(values, (item) => item.id)).toEqual([values[0], values[2]]);
		expect([...groupBy(values, (item) => item.group)]).toEqual([
			["a", [values[0], values[1]]],
			["b", [values[2]]],
		]);
		expect(partition(values, (item) => item.group === "a")).toEqual([[values[0], values[1]], [values[2]]]);
		expect(hasDuplicatesBy(values, (item) => item.id)).toBe(true);
		expect(allEqualBy(values.slice(0, 2), (item) => item.id)).toBe(true);
	});

	it("computes distinct set operations with SameValueZero semantics", () => {
		expect(difference([1, 1, 2, Number.NaN], [2])).toEqual([1, Number.NaN]);
		expect(intersection([3, 2, 2, 1], [2, 3])).toEqual([3, 2]);
		expect(allEqualBy([{ value: Number.NaN }, { value: Number.NaN }], (item) => item.value)).toBe(true);
	});

	it("ignores sparse holes without treating them as explicit undefined values", () => {
		const sparse: (number | undefined)[] = [];
		sparse[2] = 1;
		expect(unique(sparse)).toEqual([1]);
		expect(difference([undefined, 1], sparse)).toEqual([undefined]);
		const selector = vi.fn((value: number | undefined) => value);
		expect(allEqualBy(sparse, selector)).toBe(true);
		expect(selector).toHaveBeenCalledOnce();
		expect(selector).toHaveBeenCalledWith(1, 2);
	});
});

describe("Base64 utilities", () => {
	it("round-trips UTF-8, Base64URL, and arbitrary bytes", () => {
		const text = "Fast 工具库 🚀".repeat(8);
		const decodedText = decodeBase64(encodeBase64(text));
		expect(decodedText).toBe(text);
		expect(typeof decodedText).toBe("string");
		expect(decodedText.toString()).toBe(text);
		expect(decodedText.valueOf()).toBe(text);
		expect(Object.getOwnPropertyDescriptor(String.prototype, "parseJson")?.enumerable).toBe(false);
		expect(decodeBase64Url(encodeBase64Url(text))).toBe(text);
		expect(decodeBase64(encodeBase64('{"id":1}')).parseJson<{ id: number }>()).toEqual({ id: 1 });
		expect(decodeBase64(encodeBase64("not json")).parseJson()).toBe("not json");
		const bytes = Uint8Array.of(0, 1, 2, 127, 128, 254, 255);
		expect(decodeBase64Bytes(encodeBase64Bytes(bytes))).toEqual(bytes);
	});

	it("rejects malformed encodings, non-canonical tail bits, and invalid UTF-8", () => {
		expect(() => decodeBase64Bytes("abcde")).toThrow(TypeError);
		expect(() => decodeBase64Bytes("YR==")).toThrow(TypeError);
		expect(() => decodeBase64("/w==")).toThrow(TypeError);
	});

	it("resolves Encoding API capabilities only when text methods are called", () => {
		vi.stubGlobal("TextEncoder", undefined);
		expect(() => encodeBase64("text")).toThrow(Error);
		vi.unstubAllGlobals();
		vi.stubGlobal("TextDecoder", undefined);
		expect(() => decodeBase64("dGV4dA==")).toThrow(Error);
	});

	it("preserves the dictionary-compatible SecureBase64 format", () => {
		vi.stubGlobal("crypto", {
			getRandomValues: (values: Uint32Array): Uint32Array => {
				values.fill(1);
				return values;
			},
		});
		const text = "Fast 工具库";
		for (const length of [1, 5, 12, 40, 80, 160, 260]) {
			const legacyText = "Fast工具".repeat(length);
			const legacy = encodeLegacySecureBase64(legacyText);
			expect(encodeSecureBase64(legacyText)).toBe(legacy);
			expect(decodeSecureBase64(legacy)).toBe(legacyText);
		}
		const historicalGapText = "Fast工具".repeat(4);
		const historicalGapValue = encodeSecureBase64(historicalGapText);
		expect(decodeSecureBase64(historicalGapValue)).toBe(historicalGapText);
		expect(decodeLegacySecureBase64(historicalGapValue)).toBe(historicalGapText);
		expect(decodeSecureBase64(encodeSecureBase64(text, 0), 0)).toBe(text);
		expect(decodeLatin1Base64(encodeLatin1Base64("Fast"))).toBe("Fast");
	});

	it("falls back to Math.random when SecureBase64 generates its random prefix", () => {
		vi.stubGlobal("crypto", undefined);
		const encoded = encodeSecureBase64("Fast");
		expect(decodeSecureBase64(encoded)).toBe("Fast");
	});
});

describe("number utilities", () => {
	it("handles ranges, rounding, interpolation, and aggregates", () => {
		expect(clamp(9, 0, 5)).toBe(5);
		expect(inRange(5, 0, 5)).toBe(false);
		expect(inRange(5, 0, 5, true)).toBe(true);
		expect(roundTo(1.005, 2)).toBe(1.01);
		expect(Object.is(roundTo(-0.1), -0)).toBe(true);
		expect(roundTo(Number.MAX_VALUE, 2)).toBe(Number.MAX_VALUE);
		expect(lerp(10, 20, 0.25)).toBe(12.5);
		expect(lerp(-Number.MAX_VALUE, Number.MAX_VALUE, 0.5)).toBe(0);
		expect(sum([1, 2, 3])).toBe(6);
		expect(() => sum([Number.MAX_VALUE, Number.MAX_VALUE])).toThrow(RangeError);
		expect(average([2, 4])).toBe(3);
		expect(average([Number.MAX_VALUE, Number.MAX_VALUE])).toBe(Number.MAX_VALUE);
		expect(average([2, , 4] as number[])).toBe(3);
		expect(average([])).toBeUndefined();
		expect(average(new Array<number>(2))).toBeUndefined();
	});

	it("formats byte units and generates bounded random integers", () => {
		expect(formatBytes(1536)).toBe("1.5 KiB");
		expect(formatBytes(1500, { base: 1000, decimals: 0 })).toBe("2 kB");
		expect(() => formatBytes(1, { base: 10 as never })).toThrow(RangeError);
		for (let index = 0; index < 32; index += 1) expect(randomInt(-5, 5)).toBeGreaterThanOrEqual(-5);
		expect(() => randomInt(1, 1)).toThrow(RangeError);
	});
});

describe("object and query utilities", () => {
	it("recognizes plain objects and safely manipulates own keys", () => {
		const source = { count: 2, label: "fast" };
		expect(isPlainObject(source)).toBe(true);
		expect(isPlainObject(new Date())).toBe(false);
		expect(hasOwn(source, "count")).toBe(true);
		expect(pick(source, ["label"])).toEqual({ label: "fast" });
		expect(omit(source, ["count"])).toEqual({ label: "fast" });
		expect(mapValues(source, (value) => String(value))).toEqual({ count: "2", label: "fast" });
		const unusual = Object.defineProperty({} as Record<"__proto__", { safe: boolean }>, "__proto__", {
			enumerable: true,
			value: { safe: true },
		});
		const picked = pick(unusual, ["__proto__"]);
		expect(Object.hasOwn(picked, "__proto__")).toBe(true);
		expect(Object.getPrototypeOf(picked)).toBe(Object.prototype);
		expect(mapValues(unusual, (value) => value)).toEqual(picked);
	});

	it("performs SameValue shallow comparison", () => {
		expect(shallowEqual({ value: Number.NaN }, { value: Number.NaN })).toBe(true);
		expect(shallowEqual({ value: 0 }, { value: -0 })).toBe(false);
		expect(shallowEqual({ nested: {} }, { nested: {} })).toBe(false);
	});

	it("serializes repeated query keys and configurable spaces", () => {
		expect(toQueryString({ active: true, empty: null, id: [2, 1], q: "fast utils" }, { sort: true })).toBe("active=true&id=2&id=1&q=fast+utils");
		expect(toQueryString({ q: "fast utils" }, { prefixQuestionMark: true, space: "percent" })).toBe("?q=fast%20utils");
		expect(() => toQueryString({ value: Number.NaN })).toThrow(RangeError);
	});

	it("uses the DOM serializer as the single style entry", () => {
		expect(serializeStyle([{ fontSize: "14px" }, "display:block"])).toBe("font-size:14px; display:block;");
	});
});

describe("string utilities", () => {
	it("parses URL queries and repeatedly decodes components", () => {
		expect(parseQueryString("https://example.test/?a=1&empty=&a=2#hash")).toEqual({ a: ["1", "2"], empty: "" });
		expect(parseQueryString("https://example.test/path")).toEqual({});
		expect(parseQueryString("https://example.test/#fragment?ignored=true")).toEqual({});
		expect(parseQueryString("redirect=https://example.test/path?tab=one&enabled=true")).toEqual({
			enabled: "true",
			redirect: "https://example.test/path?tab=one",
		});
		const unusual = parseQueryString("__proto__=safe&constructor=plain");
		expect(unusual["__proto__"]).toBe("safe");
		expect(unusual.constructor).toBe("plain");
		expect(Object.getPrototypeOf(unusual)).toBe(Object.prototype);
		expect(decodeURIComponentRepeatedly("%2520")).toBe(" ");
	});

	it("handles JSON, word boundaries, casing, and whitespace", () => {
		expect(isValidJson("null")).toBe(true);
		expect(isValidJson('{"a":}')).toBe(false);
		expect(splitWords("XMLHttp_request-value")).toEqual(["XML", "Http", "request", "value"]);
		expect(camelCase("XMLHttp_request-value")).toBe("xmlHttpRequestValue");
		expect(pascalCase("fast-utils")).toBe("FastUtils");
		expect(kebabCase("FastUtils SDK")).toBe("fast-utils-sdk");
		expect(normalizeWhitespace("  Fast\n\tUtils  ")).toBe("Fast Utils");
	});

	it("truncates graphemes and escapes HTML text context", () => {
		expect(truncateGraphemes("A👨‍👩‍👧‍👦B", 2)).toBe("A👨‍👩‍👧‍👦…");
		expect(escapeHtml('<a title="x">Tom & Jerry\'s</a>')).toBe("&lt;a title=&quot;x&quot;&gt;Tom &amp; Jerry&#39;s&lt;/a&gt;");
		vi.stubGlobal("Intl", { Segmenter: undefined });
		expect(() => truncateGraphemes("text", 2)).toThrow(Error);
	});

	it("copies text through uni-app, Clipboard API, and the browser fallback", async () => {
		const setClipboardData = vi.fn((options: { data: string; success: () => void }) => {
			options.success();
		});
		vi.stubGlobal("uni", { setClipboardData });
		await copy("uni text");
		expect(setClipboardData.mock.calls[0]?.[0].data).toBe("uni text");

		vi.unstubAllGlobals();
		const writeText = vi.fn((_value: string) => Promise.resolve());
		vi.stubGlobal("navigator", { clipboard: { writeText } });
		vi.stubGlobal("isSecureContext", true);
		await copy("browser text");
		expect(writeText).toHaveBeenCalledWith("browser text");

		vi.unstubAllGlobals();
		const textarea = { focus: vi.fn(), remove: vi.fn(), select: vi.fn(), style: {}, value: "" };
		const appendChild = vi.fn();
		const execCommand = vi.fn((_command: string) => true);
		vi.stubGlobal("navigator", {});
		vi.stubGlobal("isSecureContext", false);
		vi.stubGlobal("document", { body: { appendChild }, createElement: vi.fn(() => textarea), execCommand });
		await copy("fallback text");
		expect(textarea.value).toBe("fallback text");
		expect(execCommand).toHaveBeenCalledWith("copy");
		expect(textarea.remove).toHaveBeenCalledOnce();
	});

	it("creates random strings and UUID v4 identifiers", () => {
		expect(randomString(24, "abc")).toMatch(/^[abc]{24}$/u);
		const id = generateUuidV4();
		expect(isUuidV4(id)).toBe(true);
		expect(() => randomString(4, "aa")).toThrow(RangeError);
		expect(() => randomString(1_000_001)).toThrow(RangeError);
	});

	it("uses the Math.random fallback for every random entry", () => {
		vi.stubGlobal("crypto", undefined);
		for (let index = 0; index < 32; index += 1) expect(randomInt(-5, 5)).toBeGreaterThanOrEqual(-5);
		expect(randomString(24, "abc")).toMatch(/^[abc]{24}$/u);
		expect(isUuidV4(generateUuidV4())).toBe(true);
	});
});

describe("date utilities", () => {
	it("clones valid dates and rejects unsupported or invalid inputs", () => {
		const source = new Date("2024-02-29T12:34:56.789Z");
		const clone = toDate(source);
		expect(clone).not.toBe(source);
		expect(clone.getTime()).toBe(source.getTime());
		expect(isValidDate(source)).toBe(true);
		expect(isValidDate("2024-02-29T00:00:00.000Z")).toBe(true);
		expect(isValidDate({})).toBe(false);
		expect(() => toDate("not-a-date")).toThrow(TypeError);
	});

	it("uses local calendar boundaries and clamps month ends", () => {
		const leapDay = addMonths(new Date(2024, 0, 31, 12), 1);
		expect([leapDay.getMonth(), leapDay.getDate(), leapDay.getHours()]).toEqual([1, 29, 12]);
		const ancientLeapDay = addMonths(new Date("0000-01-31T12:00:00.000Z"), 1);
		expect([ancientLeapDay.getFullYear(), ancientLeapDay.getMonth(), ancientLeapDay.getDate()]).toEqual([0, 1, 29]);
		expect(addDays(new Date(2024, 0, 1), 1).getDate()).toBe(2);
		expect(addYears(new Date(2024, 1, 29), 1).getDate()).toBe(28);
		expect(isSameDay("2024-01-01T01:00:00", "2024-01-01T22:00:00")).toBe(true);
		const [start, end] = getLocalDayBounds(new Date(2024, 0, 1, 12));
		expect([start.getHours(), end.getHours(), end.getMilliseconds()]).toEqual([0, 23, 999]);
		expect(startOfDay(new Date(2024, 0, 1, 12)).getHours()).toBe(0);
		expect(endOfDay(new Date(2024, 0, 1, 12)).getHours()).toBe(23);
		expect(() => addDays(new Date(), 1.5)).toThrow(RangeError);
		expect(() => addYears(new Date(), Number.MAX_SAFE_INTEGER)).toThrow(RangeError);
	});

	it("compares explicit baselines and inclusive intervals", () => {
		const start = new Date("2024-01-01T00:00:00.000Z");
		const end = new Date("2024-01-02T00:00:00.000Z");
		expect(isFuture(end, start)).toBe(true);
		expect(isFuture(start, start)).toBe(false);
		expect(isWithinInterval(start, start, end)).toBe(true);
		expect(isWithinInterval(end, start, end)).toBe(true);
		expect(isWithinInterval("2024-01-03T00:00:00.000Z", start, end)).toBe(false);
		expect(() => isWithinInterval(start, end, start)).toThrow(RangeError);
	});

	it("formats every supported relative-time unit against an explicit baseline", () => {
		const now = new Date("2024-01-02T00:00:00Z");
		expect(formatRelativeTime(new Date("2024-01-01T00:00:00Z"), { locale: "en", now, numeric: "always" })).toBe("1 day ago");
		const formatFuture = (milliseconds: number): string =>
			formatRelativeTime(now.getTime() + milliseconds, { locale: "en", now, numeric: "always" });
		expect(formatFuture(30_000)).toBe("in 30 seconds");
		expect(formatFuture(120_000)).toBe("in 2 minutes");
		expect(formatFuture(7_200_000)).toBe("in 2 hours");
		expect(formatFuture(14 * 86_400_000)).toBe("in 2 weeks");
		expect(formatFuture(60 * 86_400_000)).toBe("in 2 months");
		expect(formatFuture(2 * 365.25 * 86_400_000)).toBe("in 2 years");
	});

	it("rejects calendar arithmetic that exceeds the Date range", () => {
		expect(() => addDays(new Date(0), Number.MAX_SAFE_INTEGER)).toThrow(TypeError);
	});

	it("keeps the seven historical date capabilities as named functions", () => {
		expect(typeof getLocalTimeGreeting()).toBe("string");
		expect(formatChineseRelativeTime(undefined)).toBe("");
		expect(getStartOfToday().getMilliseconds()).toBe(0);
		const [start, end] = createOneMonthRangeFromToday();
		expect(start.getMilliseconds()).toBe(0);
		expect(end.getMilliseconds()).toBe(999);
		expect(createDateShortcuts().map(({ text }) => text)).toEqual(["今天", "昨天", "一周前", "一月前", "一年前"]);
		expect(createDateRangeShortcuts(true).map(({ text }) => text)).toEqual(["后1天", "后3天", "后1周", "后1月", "后3月", "后6月", "后1年"]);
		expect(isDateAfterNow(new Date(Date.now() + 60_000))).toBe(true);
	});
});

describe("color, style, environment, and logger utilities", () => {
	it("parses alpha colors, mixes colors, and computes contrast", () => {
		expect(parseHexColor("#0f08")).toEqual({ alpha: 136 / 255, blue: 0, green: 255, red: 0 });
		expect(formatHexColor({ blue: 0, green: 0, red: 255 })).toBe("#ff0000");
		expect(mixHexColorWithBlack("#ffffff", 1)).toBe("#000000");
		expect(mixHexColorWithWhite("#000000", 1)).toBe("#ffffff");
		expect(relativeLuminance("#000000")).toBe(0);
		expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21);
		expect(pickHigherContrastColor("#ffffff")).toBe("#000000");
	});

	it("serializes CSS without losing zero values", () => {
		expect(addCssUnit(0)).toBe("0");
		expect(addCssUnit("1.5", "rem")).toBe("1.5rem");
		expect(addCssUnit("0x10")).toBe("0x10");
		expect(serializeStyle([{ fontSize: "14px", msTransition: "all 1s" }, { color: undefined }, "display:block"])).toBe(
			"font-size:14px; -ms-transition:all 1s; display:block;"
		);
		expect(() => serializeStyle({ opacity: Number.NaN })).toThrow(RangeError);
	});

	it("detects explicit user agents without relying on method binding", () => {
		expect(isMobileUserAgent("Mozilla/5.0 iPhone Mobile")).toBe(true);
		expect(isTabletUserAgent("Mozilla/5.0 Macintosh", 5)).toBe(true);
		expect(detectRuntime()).toBe("node");
		expect(hasWebCrypto()).toBe(true);
		vi.stubGlobal("crypto", { getRandomValues: vi.fn(), subtle: null });
		expect(hasWebCrypto()).toBe(false);
		vi.unstubAllGlobals();
		vi.stubGlobal("importScripts", vi.fn());
		expect(detectRuntime()).toBe("worker");
		vi.unstubAllGlobals();
		vi.stubGlobal("window", { document: {} });
		expect(detectRuntime()).toBe("browser");
	});

	it("creates isolated scoped loggers with severity filtering", () => {
		const sink = { debug: vi.fn(), error: vi.fn(), log: vi.fn(), warn: vi.fn() };
		const customLogger = createLogger({ level: "warn", prefix: "Test", sink });
		customLogger.log("storage", "ignored");
		customLogger.warn("storage", "expired", { key: "a" });
		customLogger.error("storage", { code: 500 });
		expect(sink.log).not.toHaveBeenCalled();
		expect(sink.warn).toHaveBeenCalledWith("[Test:storage]", "expired", { key: "a" });
		expect(sink.error).toHaveBeenCalledWith("[Test:storage]", { code: 500 });
		expect(() => createLogger({ level: "trace" as never, sink })).toThrow(RangeError);
		expect(() => createLogger({ level: "info" as never, sink })).toThrow(RangeError);
		expect(() => createLogger({ prefix: 1 as never, sink })).toThrow(RangeError);
		expect(() => {
			customLogger.warn("", "invalid");
		}).toThrow(RangeError);
	});

	it("configures the stable default logger and accepts data without a message", () => {
		vi.stubGlobal("uni", {});
		vi.stubGlobal("plus", {});
		const sink = { debug: vi.fn(), error: vi.fn(), log: vi.fn(), warn: vi.fn() };
		const loggerReference = defaultLogger;
		try {
			configureLogger({ prefix: "App", sink, uniAppPlusSplit: true });
			const apiResponse = { code: 200, data: { id: 1 } };
			loggerReference.log("Launch", apiResponse);
			defaultLogger.debug("Launch");
			expect(sink.log).toHaveBeenNthCalledWith(1, "[App:Launch]");
			expect(sink.log).toHaveBeenNthCalledWith(2, '{\n  "code": 200,\n  "data": {\n    "id": 1\n  }\n}');
			expect(sink.debug).toHaveBeenCalledWith("[App:Launch]");
		} finally {
			configureLogger();
			vi.unstubAllGlobals();
		}
	});

	it("splits uni-app App-Plus data into HBuilderX-friendly lines", () => {
		vi.stubGlobal("uni", {});
		vi.stubGlobal("plus", {});
		const sink = { debug: vi.fn(), error: vi.fn(), log: vi.fn(), warn: vi.fn() };
		const circular: { self?: unknown } = {};
		circular.self = circular;
		const logger = createLogger({ level: "debug", sink, uniAppPlusSplit: true });
		const error = new Error("failed");
		logger.log("network", "request", { id: 1 }, 2n, circular);
		logger.debug("network", "debug", { id: 2 });
		logger.warn("network", "warn", { id: 3 });
		logger.error("network", "error", error);
		expect(sink.log).toHaveBeenCalledTimes(4);
		expect(sink.log).toHaveBeenNthCalledWith(1, "[Fast:network] request");
		expect(sink.log).toHaveBeenNthCalledWith(2, '{\n  "id": 1\n}');
		expect(sink.log).toHaveBeenNthCalledWith(3, "2n");
		expect(sink.log).toHaveBeenNthCalledWith(4, '{\n  "self": "[Circular]"\n}');
		expect(sink.debug).toHaveBeenNthCalledWith(1, "[Fast:network] debug");
		expect(sink.debug).toHaveBeenNthCalledWith(2, '{\n  "id": 2\n}');
		expect(sink.warn).toHaveBeenNthCalledWith(1, "[Fast:network] warn");
		expect(sink.warn).toHaveBeenNthCalledWith(2, '{\n  "id": 3\n}');
		expect(sink.error).toHaveBeenNthCalledWith(1, "[Fast:network] error");
		expect(sink.error).toHaveBeenNthCalledWith(2, error.stack ?? "Error: failed");
	});
});
