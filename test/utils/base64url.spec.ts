import { expect } from "@std/expect";

import { base64UrlDecode, base64UrlEncode } from "../../lib/utils/base64url.ts";

const INPUT = "Hello, world!";
const INPUT_BASE64URL = "SGVsbG8sIHdvcmxkIQ";

Deno.test("base64UrlEncode encodes base64url", () => {
  const inputUint8Array = new TextEncoder().encode(INPUT);
  const encoded = base64UrlEncode(inputUint8Array);
  expect(encoded).toBe(INPUT_BASE64URL);
});

Deno.test("base64UrlDecode decodes base64url", () => {
  const decoded = base64UrlDecode(INPUT_BASE64URL);
  expect(decoded.byteLength).toBe(13);
  expect(new TextDecoder().decode(decoded)).toBe(INPUT);
});

Deno.test("base64UrlDecode throws on invalid base64url", () => {
  expect(() => base64UrlDecode("SGVsbGbbb8sIHdvcmxkIQ")).toThrow();
});

Deno.test("base64UrlDecode throws on invalid type", () => {
  expect(() => base64UrlDecode(123 as any)).toThrow();
});

Deno.test("base64UrlEncode throws on invalid type", () => {
  expect(() => base64UrlEncode("foo" as any)).toThrow();
});
