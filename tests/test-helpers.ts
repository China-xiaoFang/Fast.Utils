import assert from "node:assert/strict";
import { isDeepStrictEqual } from "node:util";

interface MockState {
	readonly calls: readonly (readonly unknown[])[];
}

export type MockFunction<Arguments extends unknown[] = unknown[], Result = void> = ((...arguments_: Arguments) => Result) & {
	readonly mock: { readonly calls: Arguments[] };
};

interface Matchers {
	toBe(expected: unknown): void;
	toBeCloseTo(expected: number, precision?: number): void;
	toBeDefined(): void;
	toBeGreaterThanOrEqual(expected: number): void;
	toBeInstanceOf(expected: unknown): void;
	toBeUndefined(): void;
	toContain(expected: unknown): void;
	toEqual(expected: unknown): void;
	toHaveBeenCalled(): void;
	toHaveBeenCalledOnce(): void;
	toHaveBeenCalledTimes(expected: number): void;
	toHaveBeenCalledWith(...expected: unknown[]): void;
	toHaveBeenNthCalledWith(callNumber: number, ...expected: unknown[]): void;
	toHaveLength(expected: number): void;
	toMatch(expected: RegExp): void;
	toMatchObject(expected: Readonly<Record<PropertyKey, unknown>>): void;
	toThrow(expected?: unknown): void;
}

interface PromiseMatchers {
	toBe(expected: unknown): Promise<void>;
	toMatchObject(expected: Readonly<Record<PropertyKey, unknown>>): Promise<void>;
	toThrow(expected?: unknown): Promise<void>;
}

interface Expectation extends Matchers {
	readonly not: Matchers;
	readonly rejects: PromiseMatchers;
	readonly resolves: PromiseMatchers;
}

const originalGlobals = new Map<PropertyKey, PropertyDescriptor | undefined>();

function isObject(value: unknown): value is Readonly<Record<PropertyKey, unknown>> {
	return typeof value === "object" && value !== null;
}

function partialMatches(actual: unknown, expected: unknown): boolean {
	if (Object.is(actual, expected)) return true;
	if (!isObject(actual) || !isObject(expected)) return false;
	return Reflect.ownKeys(expected).every((key) => key in actual && partialMatches(Reflect.get(actual, key), Reflect.get(expected, key)));
}

function getMockCalls(value: unknown): readonly (readonly unknown[])[] {
	if (typeof value !== "function") assert.fail("Expected a mock function");
	const mock = Reflect.get(value, "mock") as unknown;
	assert.ok(isObject(mock) && Array.isArray(mock["calls"]), "Expected a mock function");
	return mock["calls"] as readonly (readonly unknown[])[];
}

function getErrorMessage(value: unknown): string {
	return value instanceof Error ? value.message : String(value);
}

function matchesThrown(thrown: unknown, expected: unknown): boolean {
	if (expected === undefined) return true;
	if (typeof expected === "string") return getErrorMessage(thrown).includes(expected);
	if (expected instanceof RegExp) return expected.test(getErrorMessage(thrown));
	if (typeof expected === "function") {
		const prototype = Reflect.get(expected, "prototype") as unknown;
		return typeof prototype === "object" && prototype !== null && isObject(thrown) && prototype.isPrototypeOf(thrown);
	}
	return partialMatches(thrown, expected);
}

function assertMatch(condition: boolean, negated: boolean, message: string): void {
	assert.equal(condition, !negated, message);
}

function createMatchers(actual: unknown, negated = false): Matchers {
	return {
		toBe(expected): void {
			assertMatch(Object.is(actual, expected), negated, "Expected values to be identical");
		},
		toBeCloseTo(expected, precision = 2): void {
			if (typeof actual !== "number") assert.fail("Expected a number");
			const tolerance = 10 ** -precision / 2;
			assertMatch(Math.abs(actual - expected) < tolerance, negated, `Expected ${actual} to be close to ${expected}`);
		},
		toBeDefined(): void {
			assertMatch(actual !== undefined, negated, "Expected value to be defined");
		},
		toBeGreaterThanOrEqual(expected): void {
			if (typeof actual !== "number") assert.fail("Expected a number");
			assertMatch(actual >= expected, negated, `Expected ${actual} to be greater than or equal to ${expected}`);
		},
		toBeInstanceOf(expected): void {
			const prototype = typeof expected === "function" ? (Reflect.get(expected, "prototype") as unknown) : undefined;
			const matches = typeof prototype === "object" && prototype !== null && isObject(actual) && prototype.isPrototypeOf(actual);
			assertMatch(matches, negated, "Expected value to be an instance of the supplied constructor");
		},
		toBeUndefined(): void {
			assertMatch(actual === undefined, negated, "Expected value to be undefined");
		},
		toContain(expected): void {
			const matches =
				typeof actual === "string"
					? actual.includes(String(expected))
					: Array.isArray(actual) && actual.some((value) => isDeepStrictEqual(value, expected));
			assertMatch(matches, negated, "Expected collection to contain the supplied value");
		},
		toEqual(expected): void {
			if (negated) assert.notDeepStrictEqual(actual, expected);
			else assert.deepStrictEqual(actual, expected);
		},
		toHaveBeenCalled(): void {
			assertMatch(getMockCalls(actual).length > 0, negated, "Expected mock to have been called");
		},
		toHaveBeenCalledOnce(): void {
			assertMatch(getMockCalls(actual).length === 1, negated, "Expected mock to have been called once");
		},
		toHaveBeenCalledTimes(expected): void {
			assertMatch(getMockCalls(actual).length === expected, negated, `Expected mock to have been called ${expected} times`);
		},
		toHaveBeenCalledWith(...expected): void {
			assertMatch(
				getMockCalls(actual).some((arguments_) => isDeepStrictEqual(arguments_, expected)),
				negated,
				"Expected mock to have been called with the supplied arguments"
			);
		},
		toHaveBeenNthCalledWith(callNumber, ...expected): void {
			assertMatch(
				isDeepStrictEqual(getMockCalls(actual)[callNumber - 1], expected),
				negated,
				`Expected mock call ${callNumber} to contain the supplied arguments`
			);
		},
		toHaveLength(expected): void {
			const length = isObject(actual) ? Reflect.get(actual, "length") : undefined;
			assertMatch(length === expected, negated, `Expected value to have length ${expected}`);
		},
		toMatch(expected): void {
			assertMatch(expected.test(String(actual)), negated, `Expected value to match ${String(expected)}`);
		},
		toMatchObject(expected): void {
			assertMatch(partialMatches(actual, expected), negated, "Expected value to contain the supplied properties");
		},
		toThrow(expected): void {
			if (typeof actual !== "function") assert.fail("Expected a function");
			let thrown: unknown;
			try {
				Reflect.apply(actual, undefined, []);
			} catch (error) {
				thrown = error;
			}
			assertMatch(thrown !== undefined && matchesThrown(thrown, expected), negated, "Expected function to throw the supplied error");
		},
	};
}

async function settle(value: unknown): Promise<{ readonly rejected: boolean; readonly value: unknown }> {
	try {
		return { rejected: false, value: await Promise.resolve(value) };
	} catch (error) {
		return { rejected: true, value: error };
	}
}

function createPromiseMatchers(actual: unknown, expectRejection: boolean): PromiseMatchers {
	const getValue = async (): Promise<unknown> => {
		const result = await settle(actual);
		assert.equal(result.rejected, expectRejection, expectRejection ? "Expected Promise to reject" : "Expected Promise to resolve");
		return result.value;
	};
	return {
		async toBe(expected): Promise<void> {
			assert.strictEqual(await getValue(), expected);
		},
		async toMatchObject(expected): Promise<void> {
			assert.ok(partialMatches(await getValue(), expected), "Expected Promise result to contain the supplied properties");
		},
		async toThrow(expected): Promise<void> {
			assert.ok(expectRejection, "toThrow is only supported for rejected Promises");
			assert.ok(matchesThrown(await getValue(), expected), "Expected Promise to reject with the supplied error");
		},
	};
}

const expectImplementation = (value: unknown): Expectation => {
	const matchers = createMatchers(value);
	return {
		...matchers,
		not: createMatchers(value, true),
		rejects: createPromiseMatchers(value, true),
		resolves: createPromiseMatchers(value, false),
	};
};

export const expect = expectImplementation;

export const vi = {
	fn<Arguments extends unknown[] = [], Result = void>(implementation?: (...arguments_: Arguments) => Result): MockFunction<Arguments, Result> {
		const calls: Arguments[] = [];
		const mockFunction = ((...arguments_: Arguments): Result => {
			calls.push(arguments_);
			return implementation ? implementation(...arguments_) : (undefined as Result);
		}) as MockFunction<Arguments, Result>;
		Object.defineProperty(mockFunction, "mock", { value: { calls } satisfies MockState });
		return mockFunction;
	},
	stubGlobal(key: PropertyKey, value: unknown): void {
		if (!originalGlobals.has(key)) originalGlobals.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
		Object.defineProperty(globalThis, key, { configurable: true, value, writable: true });
	},
	unstubAllGlobals(): void {
		for (const [key, descriptor] of originalGlobals) {
			if (descriptor) Object.defineProperty(globalThis, key, descriptor);
			else Reflect.deleteProperty(globalThis, key);
		}
		originalGlobals.clear();
	},
};
