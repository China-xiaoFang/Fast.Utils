// 本文件只参与 TypeScript 编译，用于验证消费者可见的公开 API 和预期类型错误。
import { defineComponent, h } from "vue";
import {
	AESDecrypt,
	AESEncrypt,
	GenerateRSAKeyPair,
	Local,
	MD5Encrypt,
	Session,
	type StorageArea,
	chunk,
	configureInstallationIdentity,
	configureStorage,
	decodeSecureBase64,
	encodeSecureBase64,
	formatChineseRelativeTime,
	groupBy,
	makeSlots,
	mapConcurrent,
	parseQueryString,
	pick,
	retry,
	serializeStyle,
	useEmits,
	useProps,
	useRender,
	withDefineType,
} from "@fast-china/utils";
import type { ComputedRef } from "vue";

type Equal<Left, Right> = (<Value>() => Value extends Left ? 1 : 2) extends <Value>() => Value extends Right ? 1 : 2 ? true : false;
type Expect<Value extends true> = Value;

const chunks = chunk([1, 2, 3] as const, 2);
type ChunkResult = Expect<Equal<typeof chunks, (1 | 2 | 3)[][]>>;

const grouped = groupBy(
	[
		{ kind: "a" as const, value: 1 },
		{ kind: "b" as const, value: 2 },
	],
	(item) => item.kind
);
const groupedCheck: Map<"a" | "b", { kind: "a" | "b"; value: number }[]> = grouped;

const selected = pick({ count: 1, label: "fast" }, ["label"] as const);
type PickResult = Expect<Equal<typeof selected, { label: string }>>;

const retried = retry(({ attempt }) => (attempt > 1 ? "done" : Promise.reject(new Error("retry"))));
const retryCheck: Promise<string> = retried;

const concurrent = mapConcurrent([1, 2], 2, (value) => Promise.resolve(String(value)));
type ConcurrentResult = Expect<Equal<typeof concurrent, Promise<string[]>>>;

const md5Digest: string = MD5Encrypt("Fast");
const inlineStyle: string = serializeStyle({ fontSize: "14px" });
const dateText: string = formatChineseRelativeTime(Date.now());
const encryptedJson = AESEncrypt(JSON.stringify({ id: 1 }), "key", "vector");
const decryptedJson: string | null = AESDecrypt(encryptedJson ?? "", "key", "vector");
const rsaKeys: Promise<{ privateKey: string; publicKey: string }> = GenerateRSAKeyPair();
const secureBase64Text: string = decodeSecureBase64(encodeSecureBase64("Fast"));

configureStorage({ prefix: "type-test:" });
configureInstallationIdentity({ cacheKey: "identity:installation-id" });
const localStorageArea: StorageArea = Local;
const sessionStorageArea: StorageArea = Session;
const stored = Local.get<{ id: number }>("item");
type StorageResult = Expect<Equal<typeof stored, { id: number } | undefined>>;

const query = parseQueryString("id=1");
const queryValue: string | string[] | undefined = query["id"];
// @ts-expect-error Query keys can be absent at runtime.
const requiredQueryValue: string | string[] = query["missing"];

const rawEmits = {
	clear: null,
	"update:modelValue": (_value: string): boolean => true,
};

defineComponent({
	emits: rawEmits,
	props: {
		disabled: Boolean,
		modelValue: String,
	},
	setup(props, { emit }) {
		const handlers = useEmits(rawEmits, emit);
		const forwarded = useProps(props, { disabled: Boolean });
		const typedForwarded: ComputedRef<{ disabled: boolean }> = forwarded;
		handlers.value["onUpdate:modelValue"]?.("value");
		handlers.value.onClear?.();
		// @ts-expect-error The event payload is declared as a string.
		handlers.value["onUpdate:modelValue"]?.(1);
		useRender(() => h("div"));
		return { handlers, typedForwarded };
	},
});

const typedValue = withDefineType<{ id: number }>();
const slots = makeSlots<{ default: never; item: { id: number } }>();

defineComponent({
	slots,
	setup(_props, { slots: componentSlots }) {
		componentSlots.default?.();
		componentSlots.item?.({ id: 1 });
		// @ts-expect-error The item slot requires a numeric id.
		componentSlots.item?.({ id: "1" });
		return (): ReturnType<typeof h> => h("div");
	},
});

void (null as unknown as ChunkResult);
void (null as unknown as PickResult);
void (null as unknown as ConcurrentResult);
void (null as unknown as StorageResult);
void groupedCheck;
void retryCheck;
void localStorageArea;
void sessionStorageArea;
void queryValue;
void requiredQueryValue;
void chunks;
void selected;
void concurrent;
void stored;
void md5Digest;
void inlineStyle;
void dateText;
void decryptedJson;
void rsaKeys;
void secureBase64Text;
void typedValue;
void slots;
