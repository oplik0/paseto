import { expect } from "@std/expect";
import {
  assertJsonStringSize,
  countKeys,
  getJsonDepth,
  returnPossibleJson,
} from "../../lib/utils/json.ts";

const JSON_DEPTH_6 = {
  a: {
    b: {
      c: {
        d: {
          e: 1,
        },
      },
    },
  },
};

const json =
  '{"a":1,"b":2,"c":3,"d":4,"e":5,"f":6,"g":7,"h":8,"i":9,"j":10,"k":11,"l":12,"m":13,"n":14,"o":15,"p":16,"q":17,"r":18,"s":19,"t":20,"u":21,"v":22,"w":23,"x":24,"y":25,"z":26}';

Deno.test("it returns the correct depth of a JSON string", () => {
  const depth = getJsonDepth(JSON.stringify(JSON_DEPTH_6));
  expect(depth).toBe(6);
});

Deno.test("it returns the correct number of keys in a JSON string", () => {
  const keys = countKeys(json);
  expect(keys).toBe(27);
});

Deno.test("it throws an error if the JSON string is too deep", () => {
  expect(() =>
    assertJsonStringSize(JSON.stringify(JSON_DEPTH_6), {
      maxDepth: 5,
      maxKeys: 100,
    })
  ).toThrow();
});

Deno.test("it throws an error if the JSON string has too many keys", () => {
  expect(() => assertJsonStringSize(json, { maxDepth: 100, maxKeys: 25 }))
    .toThrow();
});

Deno.test("it throws if the input is not JSON", () => {
  expect(() =>
    assertJsonStringSize(123 as any, { maxDepth: 100, maxKeys: 100 })
  ).toThrow();
});

Deno.test("returnPossibleJson returns the input as json if it is a json string", () => {
  const json =
    '{"a":1,"b":2,"c":3,"d":4,"e":5,"f":6,"g":7,"h":8,"i":9,"j":10,"k":11,"l":12,"m":13,"n":14,"o":15,"p":16,"q":17,"r":18,"s":19,"t":20,"u":21,"v":22,"w":23,"x":24,"y":25,"z":26}';
  const result = returnPossibleJson(json);
  expect(result).toEqual(JSON.parse(json));
});

Deno.test("returnPossibleJson returns an empty string if the input is undefined", () => {
  const result = returnPossibleJson(undefined as any);
  expect(result).toBe("");
});

Deno.test("assertJsonStringSize skips if maxDepth and maxKeys is 0", () => {
  assertJsonStringSize(json, { maxDepth: 0, maxKeys: 0 });
});
