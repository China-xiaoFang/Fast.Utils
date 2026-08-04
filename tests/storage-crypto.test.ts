import { afterEach, describe, it } from "node:test";

import {
	areBytesEqualWithoutEarlyExit,
	decryptLegacyAesCbc,
	decryptLegacyAesEcb,
	decryptLegacyAesValue,
	decryptRsaOaep,
	decryptTextWithPassword,
	deriveEcdhSecret,
	encryptLegacyAes,
	encryptLegacyAesCbc,
	encryptLegacyAesEcb,
	encryptRsaOaep,
	encryptTextWithPassword,
	generateEcdhKeyPair,
	generateEcdsaKeyPair,
	generateRandomBytes,
	generateRsaOaepKeyPair,
	md5Hex,
	md5UpperHex,
	sha1Hex,
	sha1UpperHex,
	sha256Hex,
	signEcdsa,
	verifyEcdsa,
} from "../src/crypto/index.js";
import { configureInstallationIdentity, getOrCreateInstallationId, installationIdentity } from "../src/identity/index.js";
import { Local, Session, base64StorageCodec, configureStorage, isStorageConfigured } from "../src/storage/index.js";

import { expect, vi } from "./test-helpers.js";

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

let storageNow = 1_000;
const storageClock = (): number => storageNow;
configureStorage({ now: storageClock, prefix: "test:" });

const useBrowserStorage = (): { local: MemoryStorage; session: MemoryStorage } => {
	const local = new MemoryStorage();
	const session = new MemoryStorage();
	vi.stubGlobal("localStorage", local);
	vi.stubGlobal("sessionStorage", session);
	return { local, session };
};

describe("configured browser storage", () => {
	it("configures once and exposes stable Local and Session package exports", () => {
		const { local, session } = useBrowserStorage();
		expect(isStorageConfigured()).toBe(true);
		configureStorage({ now: storageClock, prefix: "test:" });
		expect(() => {
			configureStorage({ now: storageClock, prefix: "other:" });
		}).toThrow(Error);

		Local.set("user", { id: 1 });
		Session.set("route", "/home");
		expect(Local.get("user")).toEqual({ id: 1 });
		expect(Session.get("route")).toBe("/home");
		expect(local.getItem("test:user")).toContain('"version":3');
		expect(session.getItem("test:route")).toContain('"version":3');
	});

	it("supports TTL, scoped removal, pruning, and namespace-only clearing", () => {
		const { local } = useBrowserStorage();
		storageNow = 1_000;
		local.setItem("unrelated", "keep");
		Local.set("short", 1, { ttlMs: 5 });
		Local.set("group:first", 2);
		Local.set("group:second", 3);
		storageNow = 1_006;
		expect(Local.get("short")).toBeUndefined();
		Local.removeByPrefix("group:");
		expect(Local.keys()).toEqual([]);
		Local.set("expired", 1, { ttlMs: 1 });
		storageNow = 1_008;
		expect(Local.pruneExpired()).toBe(1);
		Local.clear();
		expect(local.getItem("unrelated")).toBe("keep");
	});

	it("rejects malformed data and supports the documented Base64 codec", () => {
		const { local } = useBrowserStorage();
		local.setItem("test:broken", '{"version":99}');
		expect(() => Local.get("broken")).toThrow(TypeError);
		expect(() => {
			Local.removeByPrefix("");
		}).toThrow(TypeError);
		const encoded = base64StorageCodec.encode({ value: "Fast" });
		expect(base64StorageCodec.decode(encoded)).toEqual({ value: "Fast" });
	});
});

describe("installation identity", () => {
	it("uses configured Local storage and a shared browser identity state", () => {
		useBrowserStorage();
		configureInstallationIdentity({ cacheKey: "account:installation-id" });
		expect(installationIdentity.cacheKey).toBe("account:installation-id");
		installationIdentity.deviceId = "";
		const installationId = "123e4567-e89b-42d3-a456-426614174000";
		expect(getOrCreateInstallationId(installationId)).toBe(installationId);
		expect(installationIdentity.deviceId).toBe(installationId);
		installationIdentity.deviceId = "";
		expect(getOrCreateInstallationId()).toBe(installationId);
		installationIdentity.clear();
		expect(installationIdentity.deviceId).toBe("");
		expect(Local.get(installationIdentity.cacheKey)).toBeUndefined();
	});

	it("rejects malformed persisted identities", () => {
		useBrowserStorage();
		configureInstallationIdentity({ cacheKey: "account:installation-id" });
		installationIdentity.deviceId = "";
		Local.set(installationIdentity.cacheKey, "not-a-uuid");
		expect(() => installationIdentity.read()).toThrow(TypeError);
		expect(() => {
			configureInstallationIdentity({ cacheKey: "another-installation-id" });
		}).toThrow(Error);
	});
});

describe("Web Crypto utilities", () => {
	it("supports legacy hashes and explicit AES-CBC/AES-ECB compatibility", () => {
		expect(md5Hex("abc")).toBe("900150983cd24fb0d6963f7d28e17f72");
		expect(sha1Hex("abc")).toBe("a9993e364706816aba3e25717850c26c9cd0d89d");
		expect(md5UpperHex("abc")).toBe("900150983CD24FB0D6963F7D28E17F72");
		expect(sha1UpperHex("abc")).toBe("A9993E364706816ABA3E25717850C26C9CD0D89D");

		const key = "fast-secret";
		const vector = "fast-vector";
		const cbc = encryptLegacyAesCbc("中文 AES-CBC", key, vector);
		const ecb = encryptLegacyAesEcb("中文 AES-ECB", key);
		expect(decryptLegacyAesCbc(cbc, key, vector)).toBe("中文 AES-CBC");
		expect(decryptLegacyAesEcb(ecb, key)).toBe("中文 AES-ECB");
		const compatible = encryptLegacyAes(JSON.stringify({ mode: "CBC" }), key, vector);
		expect(decryptLegacyAesValue<{ mode: string }>(compatible, key, vector)).toEqual({ mode: "CBC" });
	});

	it("computes SHA-256 and generates random bytes", async () => {
		expect(await sha256Hex("abc")).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
		expect(generateRandomBytes(32)).toHaveLength(32);
		expect(areBytesEqualWithoutEarlyExit(Uint8Array.of(1, 2), Uint8Array.of(1, 2))).toBe(true);
		expect(areBytesEqualWithoutEarlyExit(Uint8Array.of(1, 2), Uint8Array.of(1, 3))).toBe(false);
	});

	it("keeps random generation available when only SubtleCrypto is missing", async () => {
		vi.stubGlobal("crypto", {
			getRandomValues: <Value extends ArrayBufferView>(value: Value): Value => value,
		});
		expect(generateRandomBytes(2)).toEqual(Uint8Array.of(0, 0));
		await expect(sha256Hex("value")).rejects.toThrow("SubtleCrypto is unavailable");
	});

	it("authenticates encrypted text and emits only the v2 payload", async () => {
		const payload = await encryptTextWithPassword('{"looks":"json"}', "correct horse battery staple", { iterations: 100_000 });
		expect(payload.startsWith("FAST-AES-256-GCM-V2:")).toBe(true);
		expect(await decryptTextWithPassword(payload, "correct horse battery staple")).toBe('{"looks":"json"}');
		await expect(decryptTextWithPassword(payload, "wrong password")).rejects.toThrow("authenticated or decrypted");
	});

	it("rejects unsupported and tampered payloads", async () => {
		await expect(decryptTextWithPassword("unsupported", "password")).rejects.toThrow(TypeError);
		await expect(decryptTextWithPassword("FAST-AES-256-GCM-V2:1:AA:AA:AA", "password")).rejects.toThrow(TypeError);
		const payload = await encryptTextWithPassword("secret", "correct horse battery staple", { iterations: 100_000 });
		const mutationIndex = payload.length - 2;
		const replacement = payload[mutationIndex] === "A" ? "B" : "A";
		const tampered = `${payload.slice(0, mutationIndex)}${replacement}${payload.slice(mutationIndex + 1)}`;
		await expect(decryptTextWithPassword(tampered, "correct horse battery staple")).rejects.toThrow("authenticated or decrypted");
	});

	it("rejects plaintext that could violate the bounded payload contract", async () => {
		const oversized = "a".repeat(8 * 1024 * 1024 + 1);
		await expect(encryptTextWithPassword(oversized, "password", { iterations: 100_000 })).rejects.toThrow(RangeError);
	});

	it("round-trips RSA-OAEP text with PEM keys", async () => {
		const keyPair = await generateRsaOaepKeyPair();
		const ciphertext = await encryptRsaOaep("Fast RSA", keyPair.publicKey);
		expect(await decryptRsaOaep(ciphertext, keyPair.privateKey)).toBe("Fast RSA");
	});

	it("signs with ECDSA and derives matching ECDH secrets", async () => {
		const signingKeys = await generateEcdsaKeyPair();
		const signature = await signEcdsa("Fast ECC", signingKeys.privateKey);
		expect(await verifyEcdsa("Fast ECC", signature, signingKeys.publicKey)).toBe(true);
		expect(await verifyEcdsa("tampered", signature, signingKeys.publicKey)).toBe(false);

		const alice = await generateEcdhKeyPair();
		const bob = await generateEcdhKeyPair();
		const aliceSecret = await deriveEcdhSecret(alice.privateKey, bob.publicKey);
		const bobSecret = await deriveEcdhSecret(bob.privateKey, alice.publicKey);
		expect(aliceSecret).toEqual(bobSecret);
	});
});
