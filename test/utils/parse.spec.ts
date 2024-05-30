import { expect } from "@std/expect";
import {
  PasetoKeyInvalid,
  PasetoPurposeInvalid,
  PasetoTokenInvalid,
} from "../../lib/utils/errors.ts";
import { concat, stringToUint8Array } from "../../lib/utils/uint8array.ts";
import {
  parseAssertion,
  parseFooter,
  parseKeyData,
  parseLocalToken,
  parsePayload,
  parsePublicToken,
} from "../../lib/utils/parse.ts";

import { constantTimeEqual } from "../../lib/utils/validate.ts";

const LOCAL_KEY = "k4.local.xqT1zDwAZcNCTd5Ee1B0Wpcjx-xpjbe5oNsFQfEEf-M";
const LOCAL_KEY_BYTES = new Uint8Array([
  107,
  52,
  46,
  108,
  111,
  99,
  97,
  108,
  46,
  198,
  164,
  245,
  204,
  60,
  0,
  101,
  195,
  66,
  77,
  222,
  68,
  123,
  80,
  116,
  90,
  151,
  35,
  199,
  236,
  105,
  141,
  183,
  185,
  160,
  219,
  5,
  65,
  241,
  4,
  127,
  227,
]);
const ACTUAL_KEY_BYTES = new Uint8Array([
  198,
  164,
  245,
  204,
  60,
  0,
  101,
  195,
  66,
  77,
  222,
  68,
  123,
  80,
  116,
  90,
  151,
  35,
  199,
  236,
  105,
  141,
  183,
  185,
  160,
  219,
  5,
  65,
  241,
  4,
  127,
  227,
]);

Deno.test("it parses a local key from a string", () => {
  const key = parseKeyData("local", LOCAL_KEY);
  expect(key instanceof Uint8Array).toBe(true);
  expect(key.byteLength).toBe(32);
  expect(constantTimeEqual(key, ACTUAL_KEY_BYTES)).toBe(true);
});

Deno.test("it parses a local key from a Uint8Array", () => {
  const key = parseKeyData("local", LOCAL_KEY_BYTES);
  expect(key instanceof Uint8Array).toBe(true);
  expect(key.byteLength).toBe(32);
  expect(constantTimeEqual(key, ACTUAL_KEY_BYTES)).toBe(true);
});

Deno.test("it fails to parse a raw key from a string", () => {
  expect(() =>
    parseKeyData("local", "xqT1zDwAZcNCTd5Ee1B0Wpcjx-xpjbe5oNsFQfEEf-M")
  ).toThrow(PasetoKeyInvalid);
});

Deno.test("it fails to parse a raw key from a Uint8Array", () => {
  expect(() => parseKeyData("local", ACTUAL_KEY_BYTES)).toThrow(
    PasetoKeyInvalid,
  );
});

Deno.test("it fails with unknown purpose", () => {
  expect(() => parseKeyData("unknown" as any, LOCAL_KEY)).toThrow(
    PasetoPurposeInvalid,
  );
});

Deno.test("it fails if key data is something else than a string or Uint8Array", () => {
  expect(() => parseKeyData("local", {} as any)).toThrow(PasetoKeyInvalid);
});

Deno.test("it fails if either key or purpose is missing", () => {
  expect(() => parseKeyData("local", undefined as any)).toThrow(TypeError);

  expect(() => parseKeyData(undefined as any, LOCAL_KEY)).toThrow(TypeError);
});

Deno.test("it throws if key is not 32 bytes", () => {
  expect(() => parseKeyData("local", concat(LOCAL_KEY_BYTES, ACTUAL_KEY_BYTES)))
    .toThrow(PasetoKeyInvalid);
});

Deno.test("validateFooter throws if kid claim is not a string", () => {
  expect(() => {
    parseFooter({ kid: 123 } as any);
  }).toThrow();
});

Deno.test("validateFooter throws if wpk claim is not a string", () => {
  expect(() => {
    parseFooter({ wpk: 123 } as any);
  }).toThrow();
});

Deno.test("validateFooter validates a string footer", () => {
  expect(parseFooter("{}")).toBeTruthy();
  expect(parseFooter('{"kid":"123"}')).toBeTruthy();
  expect(parseFooter('{"wpk":"123"}')).toBeTruthy();
  expect(parseFooter('{"kid":"123","wpk":"123"}')).toBeTruthy();
  expect(() => {
    parseFooter('{"kid":123}');
  }).toThrow();
  expect(() => {
    parseFooter('{"wpk":123}');
  }).toThrow();
  expect(() => {
    parseFooter('{"kid":123,"wpk":123}');
  }).toThrow();
});

Deno.test("validateFooter returns Uint8Array footer", () => {
  const footer = parseFooter(new Uint8Array([1, 2, 3]));
  expect(footer instanceof Uint8Array).toBeTruthy();
  expect(footer.length).toEqual(3);
  expect(footer[0]).toBe(1);
  expect(footer[1]).toBe(2);
  expect(footer[2]).toBe(3);
});

Deno.test("validateFooter returns object footer", () => {
  const footer = parseFooter({ kid: "123" });
  expect(footer instanceof Uint8Array).toBeTruthy();
});

Deno.test("validateFooter returns object footer that is an Uint8Array", () => {
  const footer = parseFooter(stringToUint8Array('{"kid": "123"}'));
  expect(footer instanceof Uint8Array).toBeTruthy();
});

Deno.test("validateFooter throws if input is not a string, Uint8Array or object", () => {
  expect(() => {
    parseFooter(123 as any);
  }).toThrow();
});

//
// parsePayload
//

Deno.test("parsePayload validates a string payload", () => {
  expect(parsePayload("{}")).toBeTruthy();
  expect(parsePayload('{"sub":"123"}')).toBeTruthy();
  expect(parsePayload('{"sub":"123","exp":"3070-01-01T00:00:00Z"}'))
    .toBeTruthy();
});

Deno.test("parsePayload returns a Payload object with iat and exp claims if not explicitly set in the payload, or told not to set them", () => {
  const payload = parsePayload({ sub: "123" });
  expect(payload.iat).toBeTruthy();
  expect(payload.exp).toBeTruthy();
});

Deno.test("parsePayload returns a Payload object with iat and exp claims if explicitly set in the payload", () => {
  const payload = parsePayload({
    sub: "123",
    iat: "2019-01-01T00:00:00Z",
    exp: "3070-01-01T00:00:00Z",
  });
  expect(payload.iat).toEqual("2019-01-01T00:00:00Z");
  expect(payload.exp).toEqual("3070-01-01T00:00:00Z");
});

Deno.test("parsePayload throws if sub claim is not a string", () => {
  expect(() => {
    parsePayload({ sub: 123 } as any);
  }).toThrow();
});

Deno.test("parsePayload throws if exp claim is not an ISO string", () => {
  expect(() => {
    parsePayload({ exp: 123 } as any);
  }).toThrow();
});

Deno.test("parsePayload throws if exp claim is not a valid ISO string", () => {
  expect(() => {
    parsePayload({ exp: "123" } as any);
  }).toThrow();
});

Deno.test("parsePayload throws if exp claim is in the past", () => {
  expect(() =>
    parsePayload(
      { exp: "2020-01-01T00:00:00Z", iat: "2019-01-01T00:00:00Z" } as any,
    )
  ).toThrow(Error);
});

Deno.test("parsePayload throws if string inside payload is an array", () => {
  expect(() => {
    parsePayload("[]");
  }).toThrow();
});

Deno.test("parsePayload throws if exp is before iat", () => {
  expect(() => {
    parsePayload(
      { iat: "2019-01-01T00:00:00Z", exp: "2018-01-01T00:00:00Z" } as any,
    );
  }).toThrow();
});

Deno.test("parsePayload tries to convert a non-ISO string exp", () => {
  const payload = parsePayload({ exp: "1 hour" } as any);
  expect(payload.exp).toBeTruthy();
});

Deno.test("parsePayload throws if iat claim is not an ISO string", () => {
  expect(() => {
    parsePayload({ iat: 123 } as any);
  }).toThrow();
});

Deno.test("parsePayload throws if iat claim is not a valid ISO string", () => {
  expect(() => {
    parsePayload({ iat: "123" } as any);
  }).toThrow();
});

Deno.test("parsePayload throws if iat claim is in the future", () => {
  expect(() => {
    parsePayload({ iat: "3070-01-01T00:00:00Z" } as any);
  }).toThrow();
});

// nbf

Deno.test("parsePayload tries to convert a non-ISO string nbf", () => {
  const payload = parsePayload({ nbf: 123 } as any, {
    addExp: false,
    addIat: false,
  });
  expect(payload.nbf).toBeTruthy();
});

Deno.test("parsePayload throws if nbf claim is not a valid ISO string", () => {
  expect(() => {
    parsePayload({ nbf: "123" } as any);
  }).toThrow();
});

Deno.test("parsePayload throws if nbf claim is in the future", () => {
  expect(() => {
    parsePayload({ nbf: "3070-01-01T00:00:00Z" } as any);
  }).toThrow();
});

Deno.test("parsePayload throws if nbf is before iat", () => {
  expect(() => {
    parsePayload(
      { iat: "2019-01-01T00:00:00Z", nbf: "2018-01-01T00:00:00Z" } as any,
    );
  }).toThrow();
});

Deno.test("parsePayload lets a nbf with the same iat through", () => {
  expect(() => {
    parsePayload(
      { iat: "2019-01-01T00:00:00Z", nbf: "2019-01-01T00:00:00Z" } as any,
    );
  }).toBeTruthy();
});

// jti

Deno.test("it throws if jti claim is not a string", () => {
  expect(() => {
    parsePayload({ jti: 123 } as any);
  }).toThrow();
});

// iss

Deno.test("it throws if iss claim is not a string", () => {
  expect(() => {
    parsePayload({ iss: 123 } as any);
  }).toThrow();
});

// aud

Deno.test("it throws if aud claim is not a string", () => {
  expect(() => {
    parsePayload({ aud: 123 } as any);
  }).toThrow();
});

// sub

Deno.test("it throws if sub claim is not a string", () => {
  expect(() => {
    parsePayload({ sub: 123 } as any);
  }).toThrow();
});

//
// parseLocalToken
//

Deno.test("parseLocalToken parses a local token (string)", () => {
  const token = parseLocalToken(
    "v4.local.AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAr68PS4AXe7If_ZgesdkUMvSwscFlAl1pk5HC0e8kApeaqMfGo_7OpBnwJOAbY9V7WU6abu74MmcUE8YWAiaArVI8XJ5hOb_4v9RmDkneN0S92dx0OW4pgy7omxgf3S8c3LlQg",
  );
  expect(token.payload.length).toEqual(133);
});

Deno.test("parseLocalToken parses a local token (uint8array)", () => {
  const token = parseLocalToken(
    stringToUint8Array(
      "v4.local.AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAr68PS4AXe7If_ZgesdkUMvSwscFlAl1pk5HC0e8kApeaqMfGo_7OpBnwJOAbY9V7WU6abu74MmcUE8YWAiaArVI8XJ5hOb_4v9RmDkneN0S92dx0OW4pgy7omxgf3S8c3LlQg",
    ),
  );
  expect(token.payload.length).toEqual(133);
});

Deno.test("parseLocalToken parses a token with a footer", () => {
  const token = parseLocalToken(
    "v4.local.AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAr68PS4AXe7If_ZgesdkUMvSwscFlAl1pk5HC0e8kApeaqMfGo_7OpBnwJOAbY9V7WU6abu74MmcUE8YWAiaArVI8XJ5hOb_4v9RmDkneN0S92dx0OW4pgy7omxgf3S8c3LlQg.YWJj",
  );
  expect(token.footer).toEqual(stringToUint8Array("abc"));
});

Deno.test("parseLocalToken throws if a token is more than 4 parts", () => {
  expect(() => {
    parseLocalToken(
      "v4.local.AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAr68PS4AXe7If_ZgesdkUMvSwscFlAl1pk5HC0e8kApeaqMfGo_7OpBnwJOAbY9V7WU6abu74MmcUE8YWAiaArVI8XJ5hOb_4v9RmDkneN0S92dx0OW4pgy7omxgf3S8c3LlQg.abc.def",
    );
  }).toThrow();
});

Deno.test("parseLocalToken throws if payload is less than 32 bytes", () => {
  expect(() => parseLocalToken("v4.local.abcdef")).toThrow(PasetoTokenInvalid);
});

//
// parsePublicToken
//

Deno.test("parsePublicToken parses a public token (string)", () => {
  const token = parsePublicToken(
    "v4.public.AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAr68PS4AXe7If_ZgesdkUMvSwscFlAl1pk5HC0e8kApeaqMfGo_7OpBnwJOAbY9V7WU6abu74MmcUE8YWAiaArVI8XJ5hOb_4v9RmDkneN0S92dx0OW4pgy7omxgf3S8c3LlQg",
  );
  expect(token.payload.length).toBe(133);
});

Deno.test("parsePublicToken parses a public token (uint8array)", () => {
  const token = parsePublicToken(
    stringToUint8Array(
      "v4.public.AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAr68PS4AXe7If_ZgesdkUMvSwscFlAl1pk5HC0e8kApeaqMfGo_7OpBnwJOAbY9V7WU6abu74MmcUE8YWAiaArVI8XJ5hOb_4v9RmDkneN0S92dx0OW4pgy7omxgf3S8c3LlQg",
    ),
  );
  expect(token.payload.length).toBe(133);
});

Deno.test("parsePublicToken throws if a token is more than 4 parts", () => {
  expect(() => {
    parsePublicToken(
      "v4.public.AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAr68PS4AXe7If_ZgesdkUMvSwscFlAl1pk5HC0e8kApeaqMfGo_7OpBnwJOAbY9V7WU6abu74MmcUE8YWAiaArVI8XJ5hOb_4v9RmDkneN0S92dx0OW4pgy7omxgf3S8c3LlQg.abc.def",
    );
  }).toThrow();
});

Deno.test("parsePublicToken throws if payload is less than 32 bytes", () => {
  expect(() => {
    parsePublicToken("v4.public.AAAAAAAAAAAAAAAAAAAAAAAAA");
  }).toThrow();
});

//
// parseAssertion
//

Deno.test("parseAssertion returns an Uint8array from a string", () => {
  const assertion = parseAssertion('{"sub":"123"}');
  expect(assertion instanceof Uint8Array).toBeTruthy();
});

Deno.test("parseAssertion returns an Uint8array from an object", () => {
  const assertion = parseAssertion({ sub: "123" });
  expect(assertion instanceof Uint8Array).toBeTruthy();
});

Deno.test("parseAssertion returns an Uint8array from an Uint8Array", () => {
  const assertion = parseAssertion(stringToUint8Array('{"sub":"123"}'));
  expect(assertion instanceof Uint8Array).toBeTruthy();
});
