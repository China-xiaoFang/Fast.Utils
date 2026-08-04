/** URL 查询参数支持的单值类型。 */
export type QueryPrimitive = bigint | boolean | number | string | null | undefined;

/** URL 查询参数值；数组使用重复键表示。 */
export type QueryValue = QueryPrimitive | readonly QueryPrimitive[];

/**
 * 判断 Query Value 是否为重复参数数组。
 *
 * @param value - 单值或数组形式的 Query Value。
 * @returns 是只读原始值数组时返回 `true`。
 */
const isQueryPrimitiveArray = (value: QueryValue): value is readonly QueryPrimitive[] => Array.isArray(value);

/** {@link toQueryString} 的序列化选项。 */
export interface QueryStringOptions {
	/** 返回非空结果时是否添加 `?`；默认 `false`。 */
	prefixQuestionMark?: boolean;
	/** 是否按键的 UTF-16 码元顺序稳定排序；默认保留对象枚举顺序。 */
	sort?: boolean;
	/** 空格编码方式；默认遵循表单编码并输出 `+`。 */
	space?: "percent" | "plus";
}

/**
 * 安全写入结果对象的自有可枚举属性。
 *
 * @remarks 使用 `defineProperty` 避免 `__proto__` 触发 Setter，并显式拒绝三个原型污染键。
 * @param target - 要写入的结果对象。
 * @param key - 自有属性键。
 * @param value - 属性值。
 * @throws `TypeError` 当键为 `__proto__`、`prototype` 或 `constructor`。
 */
const defineEnumerableProperty = (target: object, key: PropertyKey, value: unknown): void => {
	Object.defineProperty(target, key, { configurable: true, enumerable: true, value, writable: true });
};

/**
 * 判断值是否是普通对象。
 *
 * @param value - 任意待检查值。
 * @returns 原型为 `Object.prototype` 或 `null` 时返回 `true`。
 */
export function isPlainObject(value: unknown): value is Record<PropertyKey, unknown> {
	if (typeof value !== "object" || value === null) return false;
	const prototype = Object.getPrototypeOf(value) as object | null;
	return prototype === null || prototype === Object.prototype;
}

/**
 * 安全判断对象是否拥有自己的属性。
 *
 * @remarks 不调用可能被对象覆盖的 `hasOwnProperty`。
 * @param value - 待检查对象。
 * @param key - 字符串、数字或 Symbol 属性键。
 * @returns 属性为对象自有属性时返回 `true`，并收窄键类型。
 */
export function hasOwn<ObjectType extends object, Key extends PropertyKey>(value: ObjectType, key: Key): key is Key & keyof ObjectType {
	return Object.hasOwn(value, key);
}

/**
 * 从对象中选择指定自有可枚举属性。
 *
 * @param source - 不会被修改的源对象。
 * @param keys - 需要保留的键；不存在的键被忽略。
 * @returns 新对象，保持 `keys` 的遍历顺序。
 */
export function pick<Source extends object, Keys extends readonly (keyof Source)[]>(source: Source, keys: Keys): Pick<Source, Keys[number]> {
	const result = {} as Pick<Source, Keys[number]>;
	for (const key of keys) {
		if (Object.prototype.propertyIsEnumerable.call(source, key)) defineEnumerableProperty(result, key, source[key]);
	}
	return result;
}

/**
 * 浅复制对象并删除指定属性。
 *
 * @param source - 不会被修改的源对象。
 * @param keys - 需要排除的键。
 * @returns 包含其余自有可枚举字符串与 Symbol 属性的新对象。
 */
export function omit<Source extends object, Keys extends readonly (keyof Source)[]>(source: Source, keys: Keys): Omit<Source, Keys[number]> {
	const result = { ...source };
	for (const key of keys) Reflect.deleteProperty(result, key);
	return result;
}

/**
 * 映射对象的自有可枚举属性值。
 *
 * @param source - 不会被修改的源对象。
 * @param mapper - 接收值、键和源对象的映射函数。
 * @returns 保留原键的新对象。
 */
export function mapValues<Source extends object, Result>(
	source: Source,
	mapper: (value: Source[keyof Source], key: keyof Source, source: Source) => Result
): { [Key in keyof Source]: Result } {
	const result = {} as { [Key in keyof Source]: Result };
	for (const key of Reflect.ownKeys(source) as (keyof Source)[]) {
		if (Object.prototype.propertyIsEnumerable.call(source, key)) defineEnumerableProperty(result, key, mapper(source[key], key, source));
	}
	return result;
}

/**
 * 对自有可枚举属性执行 SameValue 浅比较。
 *
 * @remarks 嵌套对象只比较引用；`NaN` 相等，`0` 与 `-0` 不相等。
 * @param left - 第一对象。
 * @param right - 第二对象。
 * @returns 自有可枚举键集合与对应值均满足 SameValue 时返回 `true`。
 */
export function shallowEqual(left: object, right: object): boolean {
	if (Object.is(left, right)) return true;
	const leftKeys = Reflect.ownKeys(left).filter((key) => Object.prototype.propertyIsEnumerable.call(left, key));
	const rightKeys = Reflect.ownKeys(right).filter((key) => Object.prototype.propertyIsEnumerable.call(right, key));
	if (leftKeys.length !== rightKeys.length) return false;
	return leftKeys.every((key) => Object.hasOwn(right, key) && Object.is(Reflect.get(left, key), Reflect.get(right, key)));
}

/**
 * 把 Query 原始值规范化为文本。
 *
 * @param value - 已排除空值的字符串、数字、布尔值或 BigInt。
 * @returns 与 URLSearchParams 兼容的文本值。
 * @throws `RangeError` 当数字不是有限值。
 */
const serializeQueryValue = (value: Exclude<QueryPrimitive, null | undefined>): string => {
	if (typeof value === "number" && !Number.isFinite(value)) {
		throw new RangeError("Query parameter numbers must be finite.");
	}
	return String(value);
};

/**
 * 将对象序列化为标准 URL 查询字符串。
 *
 * @remarks `null` 与 `undefined` 被跳过；数组使用重复键；返回值不会修改输入。
 * @param value - 查询参数对象。
 * @param options - 排序、空格和问号前缀选项。
 * @returns URL 编码后的查询字符串；没有参数时始终返回空字符串。
 * @throws `RangeError` 当参数包含 `NaN` 或无穷数字。
 */
export function toQueryString(value: Readonly<Record<string, QueryValue>>, options: QueryStringOptions = {}): string {
	const entries = Object.entries(value);
	if (options.sort) entries.sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0));
	const parameters = new URLSearchParams();
	for (const [key, rawValue] of entries) {
		const values = isQueryPrimitiveArray(rawValue) ? rawValue : [rawValue];
		for (const item of values) {
			if (item !== null && item !== undefined) parameters.append(key, serializeQueryValue(item));
		}
	}
	let result = parameters.toString();
	if (options.space === "percent") result = result.replace(/\+/gu, "%20");
	return result && options.prefixQuestionMark ? `?${result}` : result;
}
