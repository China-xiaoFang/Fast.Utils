/** 日志严重级别，按从低到高排列。 */
export type LogLevel = "debug" | "info" | "warn" | "error";

/** 日志输出目标需要实现的最小控制台接口。 */
export interface LoggerSink {
	/**
	 * 接收通过级别过滤后的调试参数。
	 * @param data - 已格式化的品牌、作用域、消息以及保持原始类型的附加值。
	 */
	debug: (...data: unknown[]) => void;
	/**
	 * 接收通过级别过滤后的普通信息参数；对应 Logger 的 `info` 级别。
	 * @param data - 已格式化的品牌、作用域、消息以及保持原始类型的附加值。
	 */
	log: (...data: unknown[]) => void;
	/**
	 * 接收通过级别过滤后的警告参数。
	 * @param data - 已格式化的品牌、作用域、消息以及保持原始类型的附加值。
	 */
	warn: (...data: unknown[]) => void;
	/**
	 * 接收通过级别过滤后的错误参数。
	 * @param data - 已格式化的品牌、作用域、消息以及保持原始类型的附加值。
	 */
	error: (...data: unknown[]) => void;
}

/** {@link createLogger} 的不可变配置。 */
export interface LoggerOptions {
	/** 最低输出级别，默认 `info`；低于该优先级的消息不会传给 Sink。 */
	level?: LogLevel;
	/** 日志品牌前缀，默认 `Fast`；必须是无外围空白的非空字符串。 */
	prefix?: string;
	/** 可注入输出目标，默认当前运行时的 `console`；Logger 不会修改该对象。 */
	sink?: LoggerSink;
	/** uni-app App-Plus/HBuilderX 中把附加参数逐条转成单行文本输出，默认 `false`；其他平台忽略。 */
	uniAppPlusSplit?: boolean;
}

/** 配置隔离、无全局可变状态的轻量日志器。 */
export interface Logger {
	/**
	 * 输出指定作用域的调试信息。
	 * @param scope - 模块、组件或业务来源名称。
	 * @param message - 主消息文本。
	 * @param data - 保持原始类型的附加值。
	 * @throws `TypeError` 或 `RangeError` 当作用域不是无外围空白的非空字符串。
	 */
	debug: (scope: string, message: string, ...data: unknown[]) => void;
	/**
	 * 输出指定作用域的普通信息。
	 * @param scope - 模块、组件或业务来源名称。
	 * @param message - 主消息文本。
	 * @param data - 保持原始类型的附加值。
	 * @throws `TypeError` 或 `RangeError` 当作用域不是无外围空白的非空字符串。
	 */
	info: (scope: string, message: string, ...data: unknown[]) => void;
	/**
	 * 输出指定作用域的警告信息。
	 * @param scope - 模块、组件或业务来源名称。
	 * @param message - 主消息文本。
	 * @param data - 保持原始类型的附加值。
	 * @throws `TypeError` 或 `RangeError` 当作用域不是无外围空白的非空字符串。
	 */
	warn: (scope: string, message: string, ...data: unknown[]) => void;
	/**
	 * 输出指定作用域的错误信息。
	 * @param scope - 模块、组件或业务来源名称。
	 * @param message - 主消息文本。
	 * @param data - 保持原始类型的附加值。
	 * @throws `TypeError` 或 `RangeError` 当作用域不是无外围空白的非空字符串。
	 */
	error: (scope: string, message: string, ...data: unknown[]) => void;
}

const levelPriority: Readonly<Record<LogLevel, number>> = {
	debug: 10,
	info: 20,
	warn: 30,
	error: 40,
};

/**
 * 判断未知值是否为受支持日志级别。
 *
 * @param value - 待检查配置值。
 * @returns 值是 `debug`、`info`、`warn` 或 `error` 时返回 `true`。
 */
const isLogLevel = (value: unknown): value is LogLevel => typeof value === "string" && Object.hasOwn(levelPriority, value);

/** uni-app App-Plus 检测所需的平台全局对象最小视图。 */
interface RuntimeLoggerGlobals {
	/** App-Plus 原生运行时标记。 */
	plus?: unknown;
	/** uni-app 运行时标记。 */
	uni?: unknown;
}

const runtimeLoggerGlobals = globalThis as unknown as RuntimeLoggerGlobals;

/**
 * 检测 uni-app App-Plus 日志环境。
 *
 * @returns 全局 `uni` 与 `plus` 同时存在时返回 `true`。
 */
const isUniAppPlus = (): boolean => {
	return runtimeLoggerGlobals.uni !== undefined && runtimeLoggerGlobals.plus !== undefined;
};

/**
 * 把日志附加值转换为适合 HBuilderX 单行输出的文本。
 *
 * @remarks 循环引用会替换为 `[Circular]`，BigInt 保留 `n` 后缀，Error 优先输出堆栈。
 * @param value - 任意日志附加值。
 * @returns 不会因 JSON 序列化失败而中断日志调用的文本。
 */
const formatSplitValue = (value: unknown): string => {
	if (typeof value === "string") return value;
	if (typeof value === "bigint") return `${value.toString()}n`;
	if (value instanceof Error) return value.stack ?? `${value.name}: ${value.message}`;
	const visited = new WeakSet();
	try {
		const serialized: unknown = JSON.stringify(
			value,
			(_key, item: unknown): unknown => {
				if (typeof item === "bigint") return `${item.toString()}n`;
				if (typeof item !== "object" || item === null) return item;
				if (visited.has(item)) return "[Circular]";
				visited.add(item);
				return item;
			},
			2
		);
		return typeof serialized === "string" ? serialized : String(value);
	} catch {
		return String(value);
	}
};

const defaultConsoleSink: LoggerSink = {
	debug: (...data): void => {
		if (typeof console.debug === "function") console.debug(...data);
		else console.log(...data);
	},
	log: (...data): void => {
		console.log(...data);
	},
	warn: (...data): void => {
		console.warn(...data);
	},
	error: (...data): void => {
		console.error(...data);
	},
};

/**
 * 创建独立日志器。
 *
 * @remarks 本库其他模块不会自动记录、吞掉或转换异常。日志内容可能进入持久化平台，
 * 调用方不得传入密码、令牌、密钥或完整个人数据。
 * @param options - 级别、前缀、输出目标和 uni-app App-Plus 拆分选项。
 * @returns 不会修改全局控制台或其他日志器配置的新实例。
 * @throws `RangeError` 当级别未知，或前缀、作用域不是有效的非空字符串。
 */
export function createLogger(options: LoggerOptions = {}): Logger {
	const requestedLevel: unknown = options.level ?? "info";
	const requestedPrefix: unknown = options.prefix ?? "Fast";
	const sink = options.sink ?? defaultConsoleSink;
	if (!isLogLevel(requestedLevel)) throw new RangeError(`Unknown logger level: ${String(requestedLevel)}.`);
	if (typeof requestedPrefix !== "string" || requestedPrefix.length === 0) {
		throw new RangeError("Logger prefix must be a non-empty string.");
	}
	const level = requestedLevel;
	const prefix = requestedPrefix;
	const uniAppPlusSplit = options.uniAppPlusSplit ?? false;

	/**
	 * 应用级别过滤、标题格式和平台输出策略。
	 *
	 * @param messageLevel - 本条消息的严重级别。
	 * @param scope - 模块、组件或业务来源名称。
	 * @param message - 主消息文本。
	 * @param data - 保持原始类型的附加值。
	 * @throws `RangeError` 当作用域不是非空字符串或包含外围空白。
	 */
	const write = (messageLevel: LogLevel, scope: string, message: string, data: readonly unknown[]): void => {
		if (typeof scope !== "string") throw new TypeError("Logger scope must be a string.");
		if (scope.length === 0 || scope.trim() !== scope) {
			throw new RangeError("Logger scope must be a non-empty string without surrounding whitespace.");
		}
		if (levelPriority[messageLevel] < levelPriority[level]) return;
		const heading = `[${prefix}:${scope}]`;
		const sinkMethod: keyof LoggerSink = messageLevel === "info" ? "log" : messageLevel;
		if (uniAppPlusSplit && isUniAppPlus()) {
			sink[sinkMethod](`${heading} ${message}`);
			for (const item of data) sink[sinkMethod](formatSplitValue(item));
			return;
		}
		sink[sinkMethod](heading, message, ...data);
	};

	return {
		debug: (scope, message, ...data): void => {
			write("debug", scope, message, data);
		},
		info: (scope, message, ...data): void => {
			write("info", scope, message, data);
		},
		warn: (scope, message, ...data): void => {
			write("warn", scope, message, data);
		},
		error: (scope, message, ...data): void => {
			write("error", scope, message, data);
		},
	};
}

/** 默认使用 `Fast` 前缀和 `info` 级别的便捷日志器。 */
export const logger: Logger = createLogger();
