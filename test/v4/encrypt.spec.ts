import { expect } from "@std/expect";
import { stringToUint8Array } from "../../lib/utils/uint8array.ts";
import { encrypt } from "../../lib/v4/encrypt.ts";

const key = "k4.local.TTcJUvQkRlymND41zGOLoykZNhoIKk1jtr82bTl9EHA";
const MESSAGE = '{"sub":"johndoe","iat":"2023-01-09T15:34:46.865Z"}';

Deno.test("it encrypts a message using a key", () => {
  const token = encrypt(key, stringToUint8Array(MESSAGE), {
    addExp: false,
  });
  const splitToken = token.split(".");
  expect(splitToken.length).toBe(3);
  expect(splitToken[0]).toBe("v4");
  expect(splitToken[1]).toBe("local");
});

Deno.test("it encrypts a message using a key and a footer", () => {
  const token = encrypt(key, MESSAGE, {
    footer: "test",
    addExp: false,
  });
  const splitToken = token.split(".");
  expect(splitToken.length).toBe(4);
  expect(splitToken[0]).toBe("v4");
  expect(splitToken[1]).toBe("local");
});

Deno.test("it encrypts a message using a key and a footer and an assertion", () => {
  const token = encrypt(key, MESSAGE, {
    footer: "test",
    assertion: "test",
    addExp: false,
  });
  const splitToken = token.split(".");
  expect(splitToken.length).toBe(4);
  expect(splitToken[0]).toBe("v4");
  expect(splitToken[1]).toBe("local");
});

Deno.test("it throws if assertion is not a string or uint8array", () => {
  expect(() => encrypt(key, MESSAGE, { assertion: 1 as any })).toThrow();
});
