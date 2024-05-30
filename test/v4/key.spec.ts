import {
  PasetoFormatInvalid,
  PasetoPurposeInvalid,
} from "../../lib/utils/errors.ts";

import { base64UrlDecode } from "../../lib/utils/base64url.ts";
import { generateKeys } from "../../lib/v4/key.ts";
import { expect } from "@std/expect";

Deno.test("it throws with a bad purpose", () => {
  expect(() => generateKeys("badpurpose" as any)).toThrow(
    PasetoPurposeInvalid,
  );
});

Deno.test("it throws with a bad format", () => {
  expect(() =>
    generateKeys("local", {
      format: "päserk" as any,
    })
  ).toThrow(PasetoFormatInvalid);

  expect(() =>
    generateKeys("public", {
      format: "päserk" as any,
    })
  ).toThrow(PasetoFormatInvalid);
});

Deno.test("generates a random secret key for local purpose (paserk)", () => {
  const key = generateKeys("local", { format: "paserk" });
  expect(key.startsWith("k4.local.")).toBeTruthy();
  expect(key.split(".")[2].length).toBe(43);
  expect(base64UrlDecode(key.split(".")[2]).byteLength).toBe(32);
});

Deno.test("generates a random secret key for local purpose (buffer)", () => {
  const key = generateKeys("local", { format: "buffer" });
  const keyStr = new TextDecoder().decode(key);
  expect(key).toBeInstanceOf(Uint8Array);
  expect(key.byteLength).toBe(41);
  expect(keyStr.startsWith("k4.local.")).toBeTruthy();
  expect(key.slice(9).byteLength).toBe(32);
});

Deno.test("generates a random key pair for public purpose (paserk)", () => {
  const keyPair = generateKeys("public", { format: "paserk" });
  expect(keyPair.secretKey.startsWith("k4.secret.")).toBeTruthy();
  expect(keyPair.publicKey.startsWith("k4.public.")).toBeTruthy();
  expect(keyPair.secretKey.split(".")[2].length).toBeTruthy();
  expect(keyPair.publicKey.split(".")[2].length).toBeTruthy();
  expect(base64UrlDecode(keyPair.secretKey.split(".")[2]).byteLength).toBe(64);
  expect(base64UrlDecode(keyPair.publicKey.split(".")[2]).byteLength).toBe(32);
});

Deno.test("generates a random key pair for public purpose (buffer)", () => {
  const keyPair = generateKeys("public", { format: "buffer" });
  const secretKeyStr = new TextDecoder().decode(keyPair.secretKey);
  const publicKeyStr = new TextDecoder().decode(keyPair.publicKey);
  expect(keyPair.secretKey).toBeInstanceOf(Uint8Array);
  expect(keyPair.publicKey).toBeInstanceOf(Uint8Array);
  expect(keyPair.secretKey.byteLength).toBe(74);
  expect(keyPair.publicKey.byteLength).toBe(42);
  expect(secretKeyStr.startsWith("k4.secret.")).toBeTruthy();
  expect(publicKeyStr.startsWith("k4.public.")).toBeTruthy();
  expect(keyPair.secretKey.slice(10).byteLength).toBe(64);
  expect(keyPair.publicKey.slice(10).byteLength).toBe(32);
});

Deno.test("it defaults to paserk format", () => {
  const key = generateKeys("local");
  expect(key.startsWith("k4.local.")).toBeTruthy();
  expect(key.split(".")[2].length).toBe(43);
  expect(base64UrlDecode(key.split(".")[2]).byteLength).toBe(32);
});
