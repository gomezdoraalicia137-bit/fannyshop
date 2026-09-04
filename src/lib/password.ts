const ITERATIONS = 100_000;
const KEY_LENGTH = 32;
const SALT_LENGTH = 16;
const PREFIX = "pbkdf2";

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function fromBase64(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

async function derive(password: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, [
    "deriveBits",
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: salt as BufferSource, iterations, hash: "SHA-256" },
    key,
    KEY_LENGTH * 8,
  );
  return new Uint8Array(bits);
}

export async function hashPasswordValue(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const hash = await derive(password, salt, ITERATIONS);
  return `${PREFIX}$${ITERATIONS}$${toBase64(salt)}$${toBase64(hash)}`;
}

export async function verifyPasswordValue(password: string, stored: string): Promise<boolean> {
  if (stored.startsWith("$2")) {
    const bcrypt = (await import("bcryptjs")).default;
    return bcrypt.compare(password, stored);
  }

  const [prefix, iterations, salt, hash] = stored.split("$");
  if (prefix !== PREFIX || !iterations || !salt || !hash) return false;

  const derived = await derive(password, fromBase64(salt), Number(iterations));
  const expected = fromBase64(hash);
  if (derived.length !== expected.length) return false;

  let mismatch = 0;
  for (let index = 0; index < derived.length; index += 1) mismatch |= derived[index] ^ expected[index];
  return mismatch === 0;
}

export function isLegacyHash(stored: string): boolean {
  return stored.startsWith("$2");
}
