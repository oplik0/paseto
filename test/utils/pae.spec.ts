import { expect } from "@std/expect";
import { LE64, PAE } from "../../lib/utils/pae.ts";

import { stringToUint8Array } from "../../lib/utils/uint8array.ts";

Deno.test("it encodes LE64", () => {
  const input = 123456789;
  const output = LE64(input);
  expect(output.byteLength).toBe(8);
  expect(
    output,
  ).toEqual(
    new Uint8Array([0x15, 0xcd, 0x5b, 0x07, 0x00, 0x00, 0x00, 0x00]),
  );
});

Deno.test("it encodes PAE", () => {
  const input = [
    new Uint8Array([0x01, 0x02, 0x03, 0x04, 0x05]),
    new Uint8Array([0x06, 0x07, 0x08, 0x09, 0x0a]),
    new Uint8Array([0x0b, 0x0c, 0x0d, 0x0e, 0x0f]),
  ];
  const output = PAE(...input);
  expect(output.byteLength).toBe(47);
  expect(
    output,
  ).toEqual(
    new Uint8Array([
      3,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      5,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      1,
      2,
      3,
      4,
      5,
      5,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      6,
      7,
      8,
      9,
      10,
      5,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      11,
      12,
      13,
      14,
      15,
    ]),
  );
});

Deno.test('PAE([]) will always return "\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00"', () => {
  const output = PAE();
  expect(output.byteLength).toBe(8);
  expect(output).toEqual(new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0]));
});

Deno.test(`PAE(['']) will always return "\\x01\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00"`, () => {
  const input2 = [stringToUint8Array("")];
  const output2 = PAE(...input2);
  expect(output2.byteLength).toBe(16);
  expect(
    output2,
  ).toEqual(
    new Uint8Array([1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
  );
});

Deno.test(`PAE(['test']) will always return "\\x01\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x04\\x00\\x00\\x00\\x00\\x00\\x00\\x00test"`, () => {
  const input3 = [stringToUint8Array("test")];
  const output3 = PAE(...input3);
  expect(output3.byteLength).toBe(20);
  expect(
    output3,
  ).toEqual(
    new Uint8Array([
      1,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      4,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0x74,
      0x65,
      0x73,
      0x74,
    ]),
  );
});

Deno.test(`PAE('test') will throw a TypeError`, () => {
  expect(() => {
    PAE("test" as any);
  }).toThrow(TypeError);
});
