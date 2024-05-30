import { expect } from "@std/expect";
import {
  KEY_LENGTHS,
  KEY_MAGIC_BYTES,
  KEY_MAGIC_STRINGS,
  TOKEN_MAGIC_BYTES,
  TOKEN_MAGIC_STRINGS,
} from "../../lib/utils/magic.ts";

import { stringToUint8Array } from "../../lib/utils/uint8array.ts";

const CONTROL_KEY_MAGIC_STRINGS = {
  v4: {
    local: "k4.local.",
    secret: "k4.secret.",
    public: "k4.public.",
  },
};

const CONTROL_TOKEN_MAGIC_STRINGS = {
  v4: {
    local: "v4.local.",
    public: "v4.public.",
  },
};

const CONTROL_KEY_LENGTHS = {
  v4: {
    local: 32,
    secret: 64,
    public: 32,
  },
};

Deno.test("magic strings are correct", () => {
  expect(KEY_MAGIC_STRINGS).toEqual(CONTROL_KEY_MAGIC_STRINGS);
  expect(TOKEN_MAGIC_STRINGS).toEqual(CONTROL_TOKEN_MAGIC_STRINGS);
});

Deno.test("magic strings resolve to magic bytes", () => {
  for (const version of Object.keys(KEY_MAGIC_STRINGS)) {
    for (const purpose of Object.keys(KEY_MAGIC_STRINGS[version])) {
      const magicString = KEY_MAGIC_STRINGS[version][purpose];
      const magicBytes = KEY_MAGIC_BYTES[version][purpose];
      expect(stringToUint8Array(magicString)).toEqual(magicBytes);
    }
  }
  for (const version of Object.keys(TOKEN_MAGIC_STRINGS)) {
    for (const purpose of Object.keys(TOKEN_MAGIC_STRINGS[version])) {
      const magicString = TOKEN_MAGIC_STRINGS[version][purpose];
      const magicBytes = TOKEN_MAGIC_BYTES[version][purpose];
      expect(stringToUint8Array(magicString)).toEqual(magicBytes);
    }
  }
});

Deno.test("key lengths are correct", () => {
  expect(KEY_LENGTHS).toEqual(CONTROL_KEY_LENGTHS);
});
