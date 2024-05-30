import { expect } from "@std/expect";
import {
  concat,
  payloadToUint8Array,
  stringToUint8Array,
} from "../../lib/utils/uint8array.ts";

const INPUT = "Hello, world!";
const INPUT_UINT8ARRAY = new Uint8Array([
  72,
  101,
  108,
  108,
  111,
  44,
  32,
  119,
  111,
  114,
  108,
  100,
  33,
]);

Deno.test("it concatenates two Uint8Arrays", () => {
  const a = stringToUint8Array("Hello, ");
  const b = stringToUint8Array("world!");
  const c = concat(a, b);
  expect(c.byteLength).toBe(13);
  expect(c).toEqual(INPUT_UINT8ARRAY);
});

Deno.test("it converts a string to a Uint8Array", () => {
  const output = stringToUint8Array(INPUT);
  expect(output.byteLength).toBe(13);
  expect(output).toEqual(INPUT_UINT8ARRAY);
});

Deno.test("it converts a JSON string to a Uint8Array", () => {
  const output = payloadToUint8Array('{"foo":"bar"}');
  expect(output.byteLength).toBe(13);
  expect(
    output,
  ).toEqual(
    new Uint8Array([123, 34, 102, 111, 111, 34, 58, 34, 98, 97, 114, 34, 125]),
  );
});

Deno.test("it converts a Uint8Array to a Uint8Array", () => {
  const output2 = payloadToUint8Array(INPUT_UINT8ARRAY);
  expect(output2.byteLength).toBe(13);
  expect(output2).toEqual(INPUT_UINT8ARRAY);
});

Deno.test("it converts an object to a Uint8Array", () => {
  const output3 = payloadToUint8Array({ foo: "bar" });
  expect(output3.byteLength).toBe(13);
  expect(
    output3,
  ).toEqual(
    new Uint8Array([123, 34, 102, 111, 111, 34, 58, 34, 98, 97, 114, 34, 125]),
  );
});

Deno.test("it throws if the input is a number", () => {
  expect(() => {
    payloadToUint8Array(123 as any);
  }).toThrow();
});

Deno.test("it throws if the input is an incomplete JSON string", () => {
  expect(() => {
    payloadToUint8Array("{ foo: 'bar' ");
  }).toThrow();
});

Deno.test("payloadToUint8Array throws if the input is not a string, object, or Uint8Array", () => {
  expect(() => {
    payloadToUint8Array(123 as any);
  }).toThrow();
});

Deno.test("payloadToUint8Array throws if the input is a string that is not JSON", () => {
  expect(() => {
    payloadToUint8Array("foo");
  }).toThrow();
});
