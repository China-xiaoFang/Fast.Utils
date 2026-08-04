import AES from "crypto-js/aes.js";
import Hex from "crypto-js/enc-hex.js";
import Utf8 from "crypto-js/enc-utf8.js";
import MD5 from "crypto-js/md5.js";
import ECB from "crypto-js/mode-ecb.js";
import Pkcs7 from "crypto-js/pad-pkcs7.js";
import SHA1 from "crypto-js/sha1.js";

import { decodeBase64Bytes, decodeBase64UrlBytes, encodeBase64Bytes, encodeBase64UrlBytes } from "../base64/index.js";
import { encodeUtf8, getTextDecoder } from "../internal/text.js";

import type CryptoJS from "crypto-js";

/** 密码加密协议固定边界；修改任一值都需要同步安全评估、测试与文档。 */
const defaultPbkdf2Iterations = 600_000;
const minimumPbkdf2Iterations = 100_000;
const maximumPbkdf2Iterations = 5_000_000;
const maximumPasswordBytes = 1024;
const maximumPlaintextBytes = 8 * 1024 * 1024;
const maximumPayloadLength = 16 * 1024 * 1024;
const encryptedPayloadPrefix = "FAST-AES-256-GCM-V2";

/** 用于逐项验证实际依赖能力，而不是只判断 `subtle` 对象是否存在。 */
type RuntimeSubtleCrypto = Partial<
	Pick<SubtleCrypto, "decrypt" | "deriveBits" | "deriveKey" | "digest" | "encrypt" | "exportKey" | "generateKey" | "importKey" | "sign" | "verify">
>;
/** Web Crypto 的运行时最小结构，避免用不安全的类型断言掩盖能力缺失。 */
interface RuntimeCrypto extends Partial<Pick<Crypto, "getRandomValues">> {
	/** 可选 SubtleCrypto 能力；密码原语入口会继续逐项验证所需方法。 */
	subtle?: RuntimeSubtleCrypto;
}

/** Crypto 工具延迟读取的平台全局对象最小视图。 */
interface RuntimeCryptoGlobals {
	/** 可选 Web Crypto 实现；具体方法仍由每个能力入口逐项校验。 */
	crypto?: RuntimeCrypto;
}

const runtimeCryptoGlobals = globalThis as unknown as RuntimeCryptoGlobals;

/** 可直接哈希或比较的二进制输入。 */
export type TextOrBytes = string | Uint8Array;

/** {@link encryptTextWithPassword} 的密钥派生选项。 */
export interface PasswordEncryptionOptions {
	/**
	 * PBKDF2-HMAC-SHA-256 迭代次数，默认 `600_000`，允许 100,000 至 5,000,000。
	 * 低于默认值需要调用方基于目标硬件完成明确的安全与性能评估。
	 */
	iterations?: number;
}

/** CryptoJS 兼容 AES 模式。 */
export type LegacyAesCipherMode = "CBC" | "ECB";

/** Web Crypto 导出的 PEM 公私钥对。 */
export interface PemKeyPair {
	/** 未加密的 PKCS#8 PEM 私钥，包含标准 `PRIVATE KEY` 头尾和 64 字符换行。 */
	privateKey: string;
	/** SubjectPublicKeyInfo PEM 公钥，包含标准 `PUBLIC KEY` 头尾和 64 字符换行。 */
	publicKey: string;
}

/** RSA-OAEP 密钥生成选项。 */
export interface RsaKeyPairOptions {
	/** RSA 模数位数，默认 2048；必须是不小于 2048 的 256 倍数。 */
	modulusLength?: number;
}

/** 本模块支持的 Web Crypto 椭圆曲线。 */
export type EcNamedCurve = "P-256" | "P-384" | "P-521";

/**
 * 获取安全随机数能力。
 *
 * @remarks 随机字节和随机字符串不依赖 SubtleCrypto，因此这里与完整密码原语检查分开。
 * @returns 当前平台的 Crypto 对象。
 * @throws `Error` 当平台缺少 `getRandomValues`。
 */
const requireRandomCrypto = (): Crypto => {
	const crypto = runtimeCryptoGlobals.crypto;
	if (typeof crypto?.getRandomValues !== "function") {
		throw new Error("Web Crypto is unavailable in the current runtime.");
	}
	return crypto as Crypto;
};

/**
 * 获取本模块非随机 API 所需的完整 Web Crypto 能力。
 *
 * @returns 已确认实现摘要、派生、密钥导入导出、加解密、签名和验证方法的 Crypto 对象。
 * @throws `Error` 当任一必要 SubtleCrypto 方法缺失。
 */
const requireWebCrypto = (): Crypto => {
	const crypto = requireRandomCrypto();
	const subtle = (crypto as unknown as RuntimeCrypto).subtle;
	if (
		typeof subtle?.decrypt !== "function" ||
		typeof subtle.deriveBits !== "function" ||
		typeof subtle.deriveKey !== "function" ||
		typeof subtle.digest !== "function" ||
		typeof subtle.encrypt !== "function" ||
		typeof subtle.exportKey !== "function" ||
		typeof subtle.generateKey !== "function" ||
		typeof subtle.importKey !== "function" ||
		typeof subtle.sign !== "function" ||
		typeof subtle.verify !== "function"
	) {
		throw new Error("Web Crypto SubtleCrypto is unavailable in the current runtime.");
	}
	return crypto;
};

/**
 * 把二进制联合输入规范为字节。
 *
 * @param value - UTF-8 文本或现有字节数组。
 * @returns 文本的新编码结果，或原始字节数组引用。
 */
const toInputBytes = (value: TextOrBytes): Uint8Array => (typeof value === "string" ? encodeUtf8(value) : value);

/**
 * 把 Uint8Array 复制为独立的完整 ArrayBuffer。
 *
 * @remarks 不能直接返回 `bytes.buffer`，因为输入可能只是更大 Buffer 的切片。
 * @param bytes - 源字节视图。
 * @returns 长度与视图完全一致、偏移为零的新 ArrayBuffer。
 */
const toArrayBuffer = (bytes: Uint8Array): ArrayBuffer => {
	const copy = new Uint8Array(bytes.byteLength);
	copy.set(bytes);
	return copy.buffer;
};

/** 本模块导出的 PKCS#8 与 SPKI PEM 标签。 */
const pemLabels = {
	private: "PRIVATE KEY",
	public: "PUBLIC KEY",
} as const;

/**
 * 把 DER 内容封装为 PEM。
 *
 * @param label - PEM Begin/End 标签，不包含分隔线。
 * @param value - DER 二进制内容。
 * @returns 每行最多 64 个 Base64 字符的 PEM 文本。
 */
const toPem = (label: string, value: ArrayBuffer): string => {
	const encoded = encodeBase64Bytes(new Uint8Array(value));
	const lines = encoded.match(/.{1,64}/gu)?.join("\n") ?? "";
	return `-----BEGIN ${label}-----\n${lines}\n-----END ${label}-----`;
};

/**
 * 校验 PEM 标签并还原 DER。
 *
 * @param value - PEM 文本。
 * @param label - 当前算法预期的标签。
 * @returns 独立的 DER ArrayBuffer。
 * @throws `TypeError` 当 Begin/End 标签不匹配或 Base64 内容非法。
 */
const fromPem = (value: string, label: string): ArrayBuffer => {
	const header = `-----BEGIN ${label}-----`;
	const footer = `-----END ${label}-----`;
	const trimmed = value.trim();
	if (!trimmed.startsWith(header) || !trimmed.endsWith(footer)) throw new TypeError(`Expected a ${label} PEM value.`);
	const encoded = trimmed.slice(header.length, -footer.length).replace(/\s+/gu, "");
	return toArrayBuffer(decodeBase64Bytes(encoded));
};

/**
 * 导出 Web Crypto 密钥对。
 *
 * @param keyPair - 可导出的公私钥对。
 * @returns PKCS#8 私钥和 SPKI 公钥组成的 PEM 对象。
 * @throws `Error` 当平台拒绝导出或密钥格式不兼容。
 */
const exportKeyPair = async (keyPair: CryptoKeyPair): Promise<PemKeyPair> => {
	const crypto = requireWebCrypto();
	const [privateKey, publicKey] = await Promise.all([
		crypto.subtle.exportKey("pkcs8", keyPair.privateKey),
		crypto.subtle.exportKey("spki", keyPair.publicKey),
	]);
	return {
		privateKey: toPem(pemLabels.private, privateKey),
		publicKey: toPem(pemLabels.public, publicKey),
	};
};

/**
 * 缩小 Web Crypto `generateKey` 的联合返回值。
 *
 * @param value - 平台返回的单密钥或密钥对。
 * @returns 同时具有公钥和私钥的密钥对。
 * @throws `Error` 当平台没有按请求生成密钥对。
 */
const assertKeyPair = (value: CryptoKey | CryptoKeyPair): CryptoKeyPair => {
	if ("privateKey" in value && "publicKey" in value) return value;
	throw new Error("The runtime did not generate a key pair.");
};

/**
 * 按旧协议规范化 AES Key。
 *
 * @param key - 任意长度 UTF-8 文本 Key。
 * @returns 补字符 `f` 或截断到 32 个 UTF-16 Code Unit 后的 CryptoJS WordArray。
 */
const normalizeAesKey = (key: string): CryptoJS.lib.WordArray => Utf8.parse(key.padEnd(32, "f").slice(0, 32));
/**
 * 按旧协议规范化 AES IV。
 *
 * @param vector - 任意长度 UTF-8 文本 IV。
 * @returns 补字符 `f` 或截断到 16 个 UTF-16 Code Unit 后的 CryptoJS WordArray。
 */
const normalizeAesVector = (vector: string): CryptoJS.lib.WordArray => Utf8.parse(vector.padEnd(16, "f").slice(0, 16));

/**
 * 选择与 ECDSA 曲线对应的摘要算法。
 *
 * @param namedCurve - 本模块支持的 NIST 曲线。
 * @returns P-256、P-384、P-521 分别对应 SHA-256、SHA-384、SHA-512。
 */
const getEcdsaHash = (namedCurve: EcNamedCurve): "SHA-256" | "SHA-384" | "SHA-512" => {
	switch (namedCurve) {
		case "P-256":
			return "SHA-256";
		case "P-384":
			return "SHA-384";
		case "P-521":
			return "SHA-512";
	}
};

/**
 * 获取 ECDH 共享秘密的导出位数。
 *
 * @param namedCurve - 本模块支持的 NIST 曲线。
 * @returns 曲线字段按完整字节对齐后的位数；P-521 返回 528。
 */
const getEcBitLength = (namedCurve: EcNamedCurve): number => {
	switch (namedCurve) {
		case "P-256":
			return 256;
		case "P-384":
			return 384;
		case "P-521":
			return 528;
	}
};

/**
 * 校验并编码密码。
 *
 * @param password - 用户提供的密码文本。
 * @returns UTF-8 密码字节。
 * @throws `TypeError` 当密码为空。
 * @throws `RangeError` 当 UTF-8 长度超过 1,024 字节。
 */
const encodeValidatedPassword = (password: string): Uint8Array => {
	const bytes = encodeUtf8(password);
	if (bytes.length === 0) throw new TypeError("The encryption password cannot be empty.");
	if (bytes.length > maximumPasswordBytes) {
		throw new RangeError(`The UTF-8 password cannot exceed ${maximumPasswordBytes} bytes.`);
	}
	return bytes;
};

/**
 * 校验 PBKDF2 迭代次数。
 *
 * @param iterations - 待使用的迭代次数。
 * @returns 校验后的原始整数。
 * @throws `RangeError` 当值不是 100,000 至 5,000,000 的安全整数。
 */
const validateIterations = (iterations: number): number => {
	if (!Number.isSafeInteger(iterations) || iterations < minimumPbkdf2Iterations || iterations > maximumPbkdf2Iterations) {
		throw new RangeError(`iterations must be a safe integer between ${minimumPbkdf2Iterations} and ${maximumPbkdf2Iterations}.`);
	}
	return iterations;
};

/**
 * 从密码派生 AES-256-GCM Key。
 *
 * @param passwordBytes - 已校验的 UTF-8 密码。
 * @param salt - 载荷中保存的 16 字节随机盐。
 * @param iterations - 已校验 PBKDF2 成本。
 * @param usage - 派生 Key 唯一允许的加密或解密用途。
 * @returns 不可导出的 AES-GCM CryptoKey。
 * @throws `Error` 当平台缺少相应 Web Crypto 能力或拒绝派生。
 */
const derivePasswordEncryptionKey = async (
	passwordBytes: Uint8Array,
	salt: Uint8Array,
	iterations: number,
	usage: "decrypt" | "encrypt"
): Promise<CryptoKey> => {
	const crypto = requireWebCrypto();
	const material = await crypto.subtle.importKey("raw", toArrayBuffer(passwordBytes), "PBKDF2", false, ["deriveKey"]);
	return crypto.subtle.deriveKey(
		{ hash: "SHA-256", iterations, name: "PBKDF2", salt: toArrayBuffer(salt) },
		material,
		{ length: 256, name: "AES-GCM" },
		false,
		[usage]
	);
};

/**
 * 生成安全随机字节。
 *
 * @param length - 0 至 65,536 的安全整数；上限来自 Web Crypto 单次请求限制。
 * @returns 新建的 `Uint8Array`。
 * @throws 参数非法时抛出 `RangeError`；缺少 Web Crypto 时抛出 `Error`。
 */
export function generateRandomBytes(length: number): Uint8Array {
	if (!Number.isSafeInteger(length) || length < 0 || length > 65_536) {
		throw new RangeError("length must be a safe integer from 0 through 65,536.");
	}
	return requireRandomCrypto().getRandomValues(new Uint8Array(length));
}

/**
 * 计算 SHA-256 摘要。
 *
 * @remarks SHA-256 是快速摘要，不适合直接存储或校验密码。
 * @param value - UTF-8 字符串或原始字节。
 * @returns 32 字节摘要。
 * @throws 缺少 Web Crypto 或 Encoding API 时抛出 `Error`。
 */
export async function sha256Bytes(value: TextOrBytes): Promise<Uint8Array> {
	const digest = await requireWebCrypto().subtle.digest("SHA-256", toArrayBuffer(toInputBytes(value)));
	return new Uint8Array(digest);
}

/**
 * 计算 SHA-256 并格式化为十六进制。
 *
 * @param value - UTF-8 字符串或原始字节。
 * @returns 64 字符小写十六进制文本。
 * @throws 缺少 Web Crypto 或 Encoding API 时抛出 `Error`。
 */
export async function sha256Hex(value: TextOrBytes): Promise<string> {
	const digest = await sha256Bytes(value);
	return Array.from(digest, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

/**
 * 计算 MD5 摘要并返回小写十六进制文本。
 *
 * @remarks MD5 仅用于历史协议和非安全校验，不得用于密码、签名或抗碰撞场景。
 * @param value - UTF-8 文本。
 * @returns 32 字符小写十六进制摘要。
 */
export function md5Hex(value: string): string {
	return MD5(value).toString(Hex);
}

/**
 * 计算 SHA-1 摘要并返回小写十六进制文本。
 *
 * @remarks SHA-1 仅用于旧系统互通；新用途应使用 {@link sha256Hex}。
 * @param value - UTF-8 文本。
 * @returns 40 字符小写十六进制摘要。
 */
export function sha1Hex(value: string): string {
	return SHA1(value).toString(Hex);
}

/**
 * 使用 AES-256-CBC 与 PKCS#7 填充加密文本。
 *
 * @remarks 密钥按 UTF-8 文本补齐或截断为 32 个字符，IV 补齐或截断为 16 个字符。
 * 该格式不包含认证标签；新数据优先使用 {@link encryptTextWithPassword}。
 * @param plaintext - UTF-8 明文。
 * @param key - 兼容密钥文本。
 * @param vector - 兼容初始化向量文本。
 * @returns CryptoJS Base64 密文。
 */
export function encryptLegacyAesCbc(plaintext: string, key: string, vector: string): string {
	if (plaintext.length === 0) return "";
	return AES.encrypt(plaintext, normalizeAesKey(key), {
		iv: normalizeAesVector(vector),
		padding: Pkcs7,
	}).toString();
}

/** 解密 {@link encryptLegacyAesCbc} 生成的 CryptoJS Base64 密文。 */
export function decryptLegacyAesCbc(ciphertext: string, key: string, vector: string): string {
	if (ciphertext.length === 0) return "";
	return AES.decrypt(ciphertext, normalizeAesKey(key), {
		iv: normalizeAesVector(vector),
		padding: Pkcs7,
	}).toString(Utf8);
}

/**
 * 使用 AES-256-ECB 与 PKCS#7 填充加密文本。
 *
 * @remarks ECB 会暴露重复明文块结构，只能用于必须兼容的旧协议，不得用于新数据设计。
 * @param plaintext - UTF-8 明文。
 * @param key - 兼容密钥文本，补齐或截断为 32 个字符。
 * @returns CryptoJS Base64 密文。
 */
export function encryptLegacyAesEcb(plaintext: string, key: string): string {
	if (plaintext.length === 0) return "";
	return AES.encrypt(plaintext, normalizeAesKey(key), {
		mode: ECB,
		padding: Pkcs7,
	}).toString();
}

/** 解密 {@link encryptLegacyAesEcb} 生成的 CryptoJS Base64 密文。 */
export function decryptLegacyAesEcb(ciphertext: string, key: string): string {
	if (ciphertext.length === 0) return "";
	return AES.decrypt(ciphertext, normalizeAesKey(key), {
		mode: ECB,
		padding: Pkcs7,
	}).toString(Utf8);
}

/** 生成可导出的 RSA-OAEP/SHA-256 PEM 密钥对。 */
export async function generateRsaOaepKeyPair(options: RsaKeyPairOptions = {}): Promise<PemKeyPair> {
	const modulusLength = options.modulusLength ?? 2048;
	if (!Number.isSafeInteger(modulusLength) || modulusLength < 2048 || modulusLength % 256 !== 0) {
		throw new RangeError("modulusLength must be a safe integer of at least 2048 and divisible by 256.");
	}
	const crypto = requireWebCrypto();
	const keyPair = assertKeyPair(
		await crypto.subtle.generateKey(
			{
				hash: "SHA-256",
				modulusLength,
				name: "RSA-OAEP",
				publicExponent: Uint8Array.of(1, 0, 1),
			},
			true,
			["decrypt", "encrypt"]
		)
	);
	return exportKeyPair(keyPair);
}

/** 使用 RSA-OAEP/SHA-256 公钥加密 UTF-8 文本，并返回 Base64 密文。 */
export async function encryptRsaOaep(plaintext: string, publicKeyPem: string): Promise<string> {
	const crypto = requireWebCrypto();
	const key = await crypto.subtle.importKey("spki", fromPem(publicKeyPem, pemLabels.public), { hash: "SHA-256", name: "RSA-OAEP" }, false, [
		"encrypt",
	]);
	const ciphertext = await crypto.subtle.encrypt({ name: "RSA-OAEP" }, key, toArrayBuffer(encodeUtf8(plaintext)));
	return encodeBase64Bytes(new Uint8Array(ciphertext));
}

/** 使用 RSA-OAEP/SHA-256 私钥解密 Base64 密文。 */
export async function decryptRsaOaep(ciphertext: string, privateKeyPem: string): Promise<string> {
	const crypto = requireWebCrypto();
	const key = await crypto.subtle.importKey("pkcs8", fromPem(privateKeyPem, pemLabels.private), { hash: "SHA-256", name: "RSA-OAEP" }, false, [
		"decrypt",
	]);
	const plaintext = await crypto.subtle.decrypt({ name: "RSA-OAEP" }, key, toArrayBuffer(decodeBase64Bytes(ciphertext)));
	return getTextDecoder().decode(plaintext);
}

/** 生成 ECDSA PEM 签名密钥对。 */
export async function generateEcdsaKeyPair(namedCurve: EcNamedCurve = "P-256"): Promise<PemKeyPair> {
	const crypto = requireWebCrypto();
	const keyPair = assertKeyPair(await crypto.subtle.generateKey({ name: "ECDSA", namedCurve }, true, ["sign", "verify"]));
	return exportKeyPair(keyPair);
}

/** 使用 ECDSA 私钥签名文本或字节，并返回 Base64 签名。 */
export async function signEcdsa(value: TextOrBytes, privateKeyPem: string, namedCurve: EcNamedCurve = "P-256"): Promise<string> {
	const crypto = requireWebCrypto();
	const key = await crypto.subtle.importKey("pkcs8", fromPem(privateKeyPem, pemLabels.private), { name: "ECDSA", namedCurve }, false, ["sign"]);
	const signature = await crypto.subtle.sign({ hash: getEcdsaHash(namedCurve), name: "ECDSA" }, key, toArrayBuffer(toInputBytes(value)));
	return encodeBase64Bytes(new Uint8Array(signature));
}

/** 使用 ECDSA 公钥验证 Base64 签名。 */
export async function verifyEcdsa(value: TextOrBytes, signature: string, publicKeyPem: string, namedCurve: EcNamedCurve = "P-256"): Promise<boolean> {
	const crypto = requireWebCrypto();
	const key = await crypto.subtle.importKey("spki", fromPem(publicKeyPem, pemLabels.public), { name: "ECDSA", namedCurve }, false, ["verify"]);
	return crypto.subtle.verify(
		{ hash: getEcdsaHash(namedCurve), name: "ECDSA" },
		key,
		toArrayBuffer(decodeBase64Bytes(signature)),
		toArrayBuffer(toInputBytes(value))
	);
}

/** 生成 ECDH PEM 密钥协商密钥对。 */
export async function generateEcdhKeyPair(namedCurve: EcNamedCurve = "P-256"): Promise<PemKeyPair> {
	const crypto = requireWebCrypto();
	const keyPair = assertKeyPair(await crypto.subtle.generateKey({ name: "ECDH", namedCurve }, true, ["deriveBits"]));
	return exportKeyPair(keyPair);
}

/**
 * 使用本方 ECDH 私钥与对方 ECDH 公钥派生共享秘密。
 *
 * @remarks 返回值仍需经过合适的 KDF 后才能作为对称密钥，不应直接长期存储。
 */
export async function deriveEcdhSecret(privateKeyPem: string, publicKeyPem: string, namedCurve: EcNamedCurve = "P-256"): Promise<Uint8Array> {
	const crypto = requireWebCrypto();
	const [privateKey, publicKey] = await Promise.all([
		crypto.subtle.importKey("pkcs8", fromPem(privateKeyPem, pemLabels.private), { name: "ECDH", namedCurve }, false, ["deriveBits"]),
		crypto.subtle.importKey("spki", fromPem(publicKeyPem, pemLabels.public), { name: "ECDH", namedCurve }, false, []),
	]);
	const secret = await crypto.subtle.deriveBits({ name: "ECDH", public: publicKey }, privateKey, getEcBitLength(namedCurve));
	return new Uint8Array(secret);
}

/**
 * 以不提前退出的方式比较两个字节数组。
 *
 * @remarks JavaScript 引擎不保证严格常量时间；该函数只避免显式短路，不能替代服务端
 * 密码学库提供的 timing-safe primitive。长度是否相同仍属于可观察信息。
 * @param left - 第一字节序列。
 * @param right - 第二字节序列。
 * @returns 长度和每个字节均相同时返回 `true`。
 */
export function areBytesEqualWithoutEarlyExit(left: Uint8Array, right: Uint8Array): boolean {
	const length = Math.max(left.length, right.length);
	let difference = left.length === right.length ? 0 : 1;
	// 不按长度或首个差异提前退出；缺失位置按零参与累计差异。
	for (let index = 0; index < length; index += 1) difference |= (left[index] ?? 0) ^ (right[index] ?? 0);
	return difference === 0;
}

/**
 * 使用 PBKDF2-HMAC-SHA-256 派生密钥，再以 AES-256-GCM 认证加密 UTF-8 文本。
 *
 * @remarks 每次调用生成独立 16 字节盐与 12 字节 IV。输出是本库 v2 自描述载荷，
 * 不应被拆分、修改或当作跨语言标准格式。密码加密不替代密钥管理；长期高价值数据
 * 应使用平台 KMS 或专门的加密方案。
 * @param plaintext - 原始文本，不进行 JSON 推断；UTF-8 编码后最大 8 MiB。
 * @param password - 1 至 1024 UTF-8 字节的秘密口令。
 * @param options - PBKDF2 工作因子。
 * @returns 认证密文字符串；相同输入每次产生不同结果。
 * @throws 口令非法时抛出 `TypeError` 或 `RangeError`；明文过大时抛出 `RangeError`；
 * 运行时缺少 Web Crypto 或 Encoding API 时抛出 `Error`。
 */
export async function encryptTextWithPassword(plaintext: string, password: string, options: PasswordEncryptionOptions = {}): Promise<string> {
	const passwordBytes = encodeValidatedPassword(password);
	const plaintextBytes = encodeUtf8(plaintext);
	if (plaintextBytes.length > maximumPlaintextBytes) {
		throw new RangeError(`The UTF-8 plaintext cannot exceed ${maximumPlaintextBytes} bytes.`);
	}
	const iterations = validateIterations(options.iterations ?? defaultPbkdf2Iterations);
	const crypto = requireWebCrypto();
	const salt = generateRandomBytes(16);
	const iv = generateRandomBytes(12);
	const key = await derivePasswordEncryptionKey(passwordBytes, salt, iterations, "encrypt");
	// Prefix 同时作为明文版本字段和 AAD，攻击者无法在不破坏认证标签的情况下替换协议版本。
	const ciphertext = await crypto.subtle.encrypt(
		{ additionalData: toArrayBuffer(encodeUtf8(encryptedPayloadPrefix)), iv: toArrayBuffer(iv), name: "AES-GCM", tagLength: 128 },
		key,
		plaintextBytes
	);
	// 字段顺序属于持久化协议：版本、KDF 成本、盐、IV、带 GCM Tag 的密文。
	return [
		encryptedPayloadPrefix,
		String(iterations),
		encodeBase64UrlBytes(salt),
		encodeBase64UrlBytes(iv),
		encodeBase64UrlBytes(new Uint8Array(ciphertext)),
	].join(":");
}

/**
 * 解密 {@link encryptTextWithPassword} 生成的 v2 认证载荷。
 *
 * @param payload - 未修改的 v2 载荷，最大约 16 MiB 文本。
 * @param password - 加密时使用的口令。
 * @returns 原始 UTF-8 文本。
 * @throws 格式或字段非法时抛出 `TypeError`，载荷过大时抛出 `RangeError`，认证或密码
 * 失败及缺少平台能力时抛出 `Error`。
 */
export async function decryptTextWithPassword(payload: string, password: string): Promise<string> {
	const passwordBytes = encodeValidatedPassword(password);
	if (payload.length > maximumPayloadLength) {
		throw new RangeError("The encrypted payload exceeds the supported size.");
	}
	// 先验证固定字段数和版本，再对高成本 KDF 与解密进行任何工作。
	const parts = payload.split(":");
	if (parts.length !== 5 || parts[0] !== encryptedPayloadPrefix) {
		throw new TypeError("The encrypted payload format is not supported.");
	}

	let iterations: number;
	let salt: Uint8Array;
	let iv: Uint8Array;
	let ciphertext: Uint8Array;
	try {
		iterations = validateIterations(Number(parts[1]));
		salt = decodeBase64UrlBytes(parts[2] ?? "");
		iv = decodeBase64UrlBytes(parts[3] ?? "");
		ciphertext = decodeBase64UrlBytes(parts[4] ?? "");
		if (salt.length !== 16 || iv.length !== 12 || ciphertext.length < 16) {
			throw new TypeError("The encrypted payload has invalid field lengths.");
		}
	} catch (cause) {
		throw new TypeError("The encrypted payload contains invalid fields.", { cause });
	}

	const crypto = requireWebCrypto();
	const textDecoder = getTextDecoder();
	try {
		const key = await derivePasswordEncryptionKey(passwordBytes, salt, iterations, "decrypt");
		const plaintext = await crypto.subtle.decrypt(
			{ additionalData: toArrayBuffer(encodeUtf8(encryptedPayloadPrefix)), iv: toArrayBuffer(iv), name: "AES-GCM", tagLength: 128 },
			key,
			toArrayBuffer(ciphertext)
		);
		return textDecoder.decode(plaintext);
	} catch (cause) {
		throw new Error("The payload could not be authenticated or decrypted.", { cause });
	}
}

/**
 * 规范化历史 AES 模式参数。
 *
 * @param cipherMode - 公共 API 接收的未知模式值。
 * @returns 省略值和 `CBC` 返回 `CBC`，`ECB` 保持原值。
 * @throws `RangeError` 当值不是公开协议允许的字符串。
 */
const resolveLegacyAesMode = (cipherMode: unknown): LegacyAesCipherMode => {
	if (cipherMode === undefined || cipherMode === "CBC") return "CBC";
	if (cipherMode === "ECB") return "ECB";
	throw new RangeError('cipherMode must be "CBC" or "ECB".');
};

/** 解密历史 AES-CBC/ECB 字符串，并优先解析 JSON 结果。 */
export function decryptLegacyAesValue<Result = string>(
	dataStr: string,
	key: string,
	vector: string,
	cipherMode?: LegacyAesCipherMode
): Result | null {
	if (dataStr.length === 0) return null;
	try {
		const mode = resolveLegacyAesMode(cipherMode);
		const plaintext = mode === "ECB" ? decryptLegacyAesEcb(dataStr, key) : decryptLegacyAesCbc(dataStr, key, vector);
		if (plaintext.length === 0) return null;
		try {
			return JSON.parse(plaintext) as Result;
		} catch {
			return plaintext as Result;
		}
	} catch {
		return null;
	}
}

/** 按指定 CBC/ECB 模式加密历史 AES 字符串。 */
export function encryptLegacyAes(dataStr: string, key: string, vector: string, cipherMode?: LegacyAesCipherMode): string {
	const mode = resolveLegacyAesMode(cipherMode);
	return mode === "ECB" ? encryptLegacyAesEcb(dataStr, key) : encryptLegacyAesCbc(dataStr, key, vector);
}

/** 返回历史兼容的大写 MD5 十六进制摘要。 */
export function md5UpperHex(value: string): string {
	return value.length === 0 ? value : md5Hex(value).toUpperCase();
}

/** 返回历史兼容的大写 SHA-1 十六进制摘要。 */
export function sha1UpperHex(value: string): string {
	return value.length === 0 ? value : sha1Hex(value).toUpperCase();
}
