import { afterEach, describe, it } from "node:test";
import { Local, Session, configureStorage, isStorageConfigured } from "../src/storage/index";
import { expect, vi } from "./test-helpers";

afterEach(() => {
	vi.unstubAllGlobals();
});

class MemoryStorage {
	readonly #values = new Map<string, string>();

	get length(): number {
		return this.#values.size;
	}

	getItem(key: string): string | null {
		return this.#values.get(key) ?? null;
	}

	key(index: number): string | null {
		return [...this.#values.keys()][index] ?? null;
	}

	removeItem(key: string): void {
		this.#values.delete(key);
	}

	setItem(key: string, value: string): void {
		this.#values.set(key, value);
	}
}

describe("default browser storage", () => {
	it("works without configureStorage and preserves the legacy fast__ prefix", () => {
		const local = new MemoryStorage();
		const session = new MemoryStorage();
		vi.stubGlobal("localStorage", local);
		vi.stubGlobal("sessionStorage", session);

		expect(isStorageConfigured()).toBe(false);
		Local.set("profile", { id: 1 });
		Session.set("route", "/home");

		expect(isStorageConfigured()).toBe(true);
		expect(Local.prefix).toBe("fast__");
		expect(Local.get("profile")).toEqual({ id: 1 });
		expect(Session.get("route")).toBe("/home");
		expect(local.getItem("fast__profile")).toContain("id");
		expect(typeof session.getItem("fast__route")).toBe("string");

		configureStorage();
		expect(() => configureStorage({ prefix: "other:" })).toThrow(Error);
	});
});
