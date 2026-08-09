import { describe, it } from "node:test";

import { createApp, createRenderer, defineComponent, h, reactive } from "vue";

import { useEmits } from "../src/vue/emits";
import { useExpose } from "../src/vue/expose";
import { callOptionalFunction } from "../src/vue/func";
import { withInstall, withInstallDirective, withNoopInstall } from "../src/vue/install";
import { definePropType, useProps } from "../src/vue/props";
import { useRender } from "../src/vue/render";
import { makeSlots } from "../src/vue/slots";
import { withDefineType } from "../src/vue/with";

import { expect, vi } from "./test-helpers";

describe("Vue event and props helpers", () => {
	it("maps event tuple types to real Vue handler names", () => {
		const emits = { clear: null, "update:modelValue": (_value: string): boolean => true };
		const emit = vi.fn((eventName: string, ...arguments_: unknown[]): void => {
			void eventName;
			void arguments_;
		});
		const handlers = useEmits(emits, emit).value;
		handlers["onUpdate:modelValue"]?.("value");
		handlers.onClear?.();
		expect(emit).toHaveBeenNthCalledWith(1, "update:modelValue", "value");
		expect(emit).toHaveBeenNthCalledWith(2, "clear");
	});

	it("accepts the emitter provided by Vue setup", () => {
		const emits = { clear: null, "update:modelValue": (_value: string): boolean => true };
		const component = defineComponent({
			emits,
			setup(_props, { emit }) {
				return { handlers: useEmits(emits, emit) };
			},
		});
		expect(component).toBeDefined();
	});

	it("keeps selected props reactive and typed", () => {
		const props = reactive({ id: 1, label: "first" });
		const selected = useProps(props, { id: Number, label: String }, ["label"]);
		expect(selected.value).toEqual({ id: 1 });
		props.id = 2;
		expect(selected.value).toEqual({ id: 2 });
	});

	it("returns Vue-compatible prop and slot runtime declarations", () => {
		expect(definePropType<string>(String)).toBe(String);
		expect(makeSlots<{ default: never; item: { id: number } }>()).toBe(Object);
	});

	it("keeps setup state visible when TSX rendering is installed separately", () => {
		type HostNode = Record<string, unknown>;
		const renderer = createRenderer<HostNode, HostNode>({
			createComment: (text): HostNode => ({ text }),
			createElement: (type): HostNode => ({ type }),
			createText: (text): HostNode => ({ text }),
			insert: (): void => undefined,
			nextSibling: (): null => null,
			parentNode: (): null => null,
			patchProp: (): void => undefined,
			remove: (): void => undefined,
			setElementText: (element, text): void => {
				element["text"] = text;
			},
			setText: (node, text): void => {
				node["text"] = text;
			},
		});
		const component = defineComponent({
			setup(_props, { expose }) {
				const state = reactive({ count: 1 });
				useRender(() => h("div", String(state.count)));
				return useExpose(expose, { state });
			},
		});
		const proxy = renderer.createApp(component).mount({});
		expect((proxy as unknown as { state: { count: number } }).state.count).toBe(1);
		expect(() => {
			useRender(() => h("div"));
		}).toThrow(Error);
	});

	it("preserves type helpers and executes sync or async functions", async () => {
		const value = { id: 1 };
		expect(withDefineType(value)).toBe(value);
		expect(withDefineType<{ id: number }>()).toBeUndefined();
		await expect(callOptionalFunction((amount: number) => amount + 1, 1)).resolves.toBe(2);
		await expect(callOptionalFunction((amount: number) => Promise.resolve(amount + 2), 1)).resolves.toBe(3);
		await expect(callOptionalFunction(undefined)).resolves.toBe(undefined);
	});
});

describe("Vue install helpers", () => {
	it("registers main and extra named components", () => {
		const main = { name: "FastMain", render: (): null => null };
		const extra = { name: "FastExtra", render: (): null => null };
		const installable = withInstall(main, { Extra: extra });
		const app = createApp({ render: (): null => null });
		app.use(installable);
		expect(app.component("FastMain")).toBe(main);
		expect(app.component("FastExtra")).toBe(extra);
		expect(installable.Extra).toBe(extra);
	});

	it("supports no-op installation for attached components", () => {
		const component = { name: "FastAttached", render: (): null => null };
		const installable = withNoopInstall(component);
		const app = createApp({ render: (): null => null });
		app.use(installable);
		expect(app.component("FastAttached")).toBeUndefined();
		expect(() => withNoopInstall(installable)).toThrow(TypeError);
	});

	it("does not silently overwrite components already owned by an app", () => {
		const existing = { name: "FastMain", render: (): null => null };
		const incoming = withInstall({ name: "FastMain", render: (): null => null });
		const app = createApp({ render: (): null => null });
		app.component("FastMain", existing);

		expect(() => app.use(incoming)).toThrow(Error);
		expect(app.component("FastMain")).toBe(existing);
	});

	it("preflights every app registration before changing the app", () => {
		const main = { name: "FastMain", render: (): null => null };
		const extra = { name: "FastExtra", render: (): null => null };
		const existing = { name: "FastExtra", render: (): null => null };
		const installable = withInstall(main, { Extra: extra });
		const app = createApp({ render: (): null => null });
		app.component("FastExtra", existing);

		expect(() => app.use(installable)).toThrow(Error);
		expect(app.component("FastMain")).toBeUndefined();
		expect(app.component("FastExtra")).toBe(existing);
	});

	it("registers directives and validates public names", () => {
		const directive = { mounted: vi.fn() };
		const installable = withInstallDirective(directive, "focus");
		const app = createApp({ render: (): null => null });
		app.use(installable);
		expect(app.directive("focus")).toBe(directive);
		expect(() => withInstallDirective(directive, "")).toThrow(TypeError);
		expect(() => withInstallDirective(directive, "   ")).toThrow(TypeError);
		expect(() => withInstallDirective({ mounted: vi.fn() }, " focus ")).toThrow(TypeError);
		expect(() => withInstallDirective({ mounted: vi.fn() }, "v-focus")).toThrow(TypeError);
		expect(() => withInstallDirective(installable, "focus-again")).toThrow(TypeError);
		const inheritedInstall = Object.create({ install: vi.fn() }) as { mounted: () => void };
		inheritedInstall.mounted = vi.fn();
		expect(() => withInstallDirective(inheritedInstall, "inherited")).toThrow(TypeError);

		const conflictingApp = createApp({ render: (): null => null });
		const existing = { mounted: vi.fn() };
		conflictingApp.directive("focus", existing);
		expect(() => conflictingApp.use(installable)).toThrow(Error);
		expect(conflictingApp.directive("focus")).toBe(existing);
	});

	it("validates every component and extra key before mutating the main component", () => {
		const main = { name: "FastMain", render: (): null => null };
		const extra = { name: "FastExtra", render: (): null => null };
		expect(() => withInstall(main, { install: extra })).toThrow(TypeError);
		expect(Object.hasOwn(main, "install")).toBe(false);
		const existingInstall = vi.fn();
		const alreadyInstallable = { install: existingInstall, name: "FastInstalled", render: (): null => null };
		expect(() => withInstall(alreadyInstallable)).toThrow(TypeError);
		expect(alreadyInstallable.install).toBe(existingInstall);
		expect(() => withInstall({ name: " ", render: (): null => null })).toThrow(TypeError);
		expect(() => withInstall({ name: " FastMain ", render: (): null => null })).toThrow(TypeError);
		expect(() => withInstall({ name: "Fast Main", render: (): null => null })).toThrow(TypeError);
		expect(() => withInstall(main, { constructor: extra })).toThrow(TypeError);
		expect(() => withInstall(main, { Duplicate: { name: "FastMain", render: (): null => null } })).toThrow(TypeError);
	});

	it("rejects duplicate or colliding event handler names", () => {
		const emits = { "save-item": null, saveItem: null };
		const emit = (_eventName: "save-item" | "saveItem"): void => undefined;
		expect(() => useEmits(emits, emit).value).toThrow(TypeError);
	});
});
