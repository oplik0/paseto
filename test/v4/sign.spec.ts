import {
  PasetoClaimInvalid,
  PasetoKeyInvalid,
  PasetoPayloadInvalid,
} from "../../lib/utils/errors.ts";
import {
  stringToUint8Array,
  uint8ArrayToString,
} from "../../lib/utils/uint8array.ts";
import { base64UrlDecode } from "../../lib/utils/base64url.ts";
import { sign } from "../../lib/v4/sign.ts";
import { expect } from "@std/expect";

const keys = {
  secretKey:
    "k4.secret.LMThyMVJEesfQX93MJsB77ISs8Ya9YnaEw3Qk-lZvlD7QjtJYfpqqXLflv8Oa82ganJzicoFxwgtcjdc5jMCYA",
  publicKey: "k4.public.-0I7SWH6aqly35b_DmvNoGpyc4nKBccILXI3XOYzAmA",
};
const MESSAGE = '{"sub":"johndoe","iat":"2023-01-09T15:34:46.865Z"}';

// Keys and token generated with panva/paseto for control
const PANVA_KEYS = {
  secretKey:
    "k4.secret.FgbULh0ylLoBsG6KRi2ZM0ZDzNMgaCBp1jB0sbf8OXGBf_1Cd0wyDa76n-iN0qGj0vaYSu5QXdZhbj5lUWhkyA",
  publicKey: "k4.public.gX_9QndMMg2u-p_ojdKho9L2mEruUF3WYW4-ZVFoZMg",
};
const PANVA_TOKEN =
  "v4.public.eyJzdWIiOiJuYXBvbGVvbiIsImlhdCI6IjIwMjMtMDEtMTNUMTQ6MTU6NDYuNjQ4WiIsImV4cCI6IjMwMjMtMDEtMDlUMTU6MzQ6NDYuODY1WiJ9sMzd6MAe67mw9cpHxQk8VeEVua-90CoRnl6ubAcDUnfpKhu-tWkW2igPi2DZPrSO8GwWzp4cxMo-vgqaQ2OhCg";
const PANVA_MESSAGE = {
  sub: "napoleon",
  iat: "2023-01-13T14:15:46.648Z",
  exp: "3023-01-09T15:34:46.865Z",
};

function base64urlToString(str: string) {
  return uint8ArrayToString(base64UrlDecode(str));
}

//
// Keys
//

Deno.test("it throws with an invalid key (string)", () => {
  expect(() => sign("invalid", MESSAGE)).toThrow(PasetoKeyInvalid);
});

Deno.test("it throws with a key that starts with v4.public. (string)", () => {
  expect(() => sign("v4.public.invalid", MESSAGE)).toThrow(PasetoKeyInvalid);
});

Deno.test("it throws with a key that starts with v4.local. (string)", () => {
  expect(() => sign("v4.local.invalid", MESSAGE)).toThrow(PasetoKeyInvalid);
});

Deno.test("it throws with an invalid key that starts with v4.secret. (string)", () => {
  expect(() => sign("v4.secret.invalid", MESSAGE)).toThrow(PasetoKeyInvalid);
});

Deno.test("it throws with an invalid key (Uint8Array)", () => {
  expect(() => sign(stringToUint8Array("invalid"), MESSAGE)).toThrow(
    PasetoKeyInvalid,
  );
});

Deno.test("it throws with a key that starts with v4.public. (Uint8Array)", () => {
  expect(() => sign(stringToUint8Array("v4.public.invalid"), MESSAGE)).toThrow(
    PasetoKeyInvalid,
  );
});

Deno.test("it throws with a key that starts with v4.local. (Uint8Array)", () => {
  expect(() => sign(stringToUint8Array("v4.local.invalid"), MESSAGE)).toThrow(
    PasetoKeyInvalid,
  );
});

Deno.test("it throws with an invalid key that starts with v4.secret. (Uint8Array)", () => {
  expect(() => sign(stringToUint8Array("v4.secret.invalid"), MESSAGE)).toThrow(
    PasetoKeyInvalid,
  );
});

Deno.test("it throws if key is not a string or Uint8Array", () => {
  expect(() => sign(123 as any, MESSAGE)).toThrow(PasetoKeyInvalid);

  expect(() => sign({} as any, MESSAGE)).toThrow(PasetoKeyInvalid);

  expect(() => sign([] as any, MESSAGE)).toThrow(PasetoKeyInvalid);

  expect(() => sign(true as any, MESSAGE)).toThrow(PasetoKeyInvalid);

  expect(() => sign(null as any, MESSAGE)).toThrow(TypeError);

  expect(() => sign(undefined as any, MESSAGE)).toThrow(TypeError);

  expect(() => sign(Symbol("invalid") as any, MESSAGE)).toThrow(
    PasetoKeyInvalid,
  );

  expect(() => sign((() => {}) as any, MESSAGE)).toThrow(PasetoKeyInvalid);

  expect(() => sign(new Date() as any, MESSAGE)).toThrow(PasetoKeyInvalid);
});

//
// Claims
//

Deno.test("it throws is message is not a JSON string", () => {
  const msg = "Hello, world!";

  expect(() => sign(keys.secretKey, msg)).toThrow(PasetoPayloadInvalid);
});

Deno.test("it throws is message is not a JSON string (Uint8Array)", () => {
  const msg = stringToUint8Array("Hello, world!");

  expect(() => sign(keys.secretKey, msg)).toThrow(PasetoPayloadInvalid);
});

Deno.test("it throws with malformed JSON", () => {
  const msg = '{ "foo": "bar"';

  expect(() => sign(keys.secretKey, msg)).toThrow(PasetoPayloadInvalid);
});

Deno.test("it throws with malformed JSON (Uint8Array)", () => {
  const msg = stringToUint8Array('{ "foo": "bar"');

  expect(() => sign(keys.secretKey, msg)).toThrow(PasetoPayloadInvalid);
});

Deno.test("it throws if message is not a string or Uint8Array", () => {
  expect(() => sign(keys.secretKey, 123 as any)).toThrow(PasetoPayloadInvalid);

  expect(() => sign(keys.secretKey, "rocky balboa" as any)).toThrow(
    PasetoPayloadInvalid,
  );

  expect(() => sign(keys.secretKey, true as any)).toThrow(PasetoPayloadInvalid);

  expect(() => sign(keys.secretKey, [] as any)).toThrow(PasetoPayloadInvalid);

  expect(() => sign(keys.secretKey, null as any)).toThrow(PasetoPayloadInvalid);

  expect(() => sign(keys.secretKey, undefined as any)).toThrow(
    PasetoPayloadInvalid,
  );
});

Deno.test("it throws is iat is not a parseable date", () => {
  const msg = { iat: "bubbles" };

  expect(() => sign(keys.secretKey, msg as any)).toThrow(PasetoClaimInvalid);
});

Deno.test("it throws if nbf is not a parseable date", () => {
  const msg = { nbf: "bubbles" };

  expect(() => sign(keys.secretKey, msg as any)).toThrow(PasetoClaimInvalid);
});

Deno.test("it throws if exp is not a parseable date", () => {
  const msg = { exp: "bubbles" };

  expect(() => sign(keys.secretKey, msg as any)).toThrow(PasetoClaimInvalid);
});

Deno.test("it throws if exp is before iat", () => {
  const msg = {
    iat: new Date().toISOString(),
    exp: new Date(0).toISOString(),
  };

  expect(() => sign(keys.secretKey, msg as any)).toThrow(PasetoClaimInvalid);
});

Deno.test("it throws if exp is before nbf", () => {
  const msg = {
    nbf: new Date().toISOString(),
    exp: new Date(0).toISOString(),
  };

  expect(() => sign(keys.secretKey, msg as any)).toThrow(PasetoClaimInvalid);
});

Deno.test("it throws if nbf is before iat", () => {
  const msg = {
    iat: new Date().toISOString(),
    nbf: new Date(0).toISOString(),
  };

  expect(() => sign(keys.secretKey, msg as any)).toThrow(PasetoClaimInvalid);
});

Deno.test("it throws if exp is before now", () => {
  const msg = { exp: new Date(0).toISOString() };

  expect(() => sign(keys.secretKey, msg as any)).toThrow(PasetoClaimInvalid);
});

//
// Payload
//

Deno.test("it generates an iat claim if none is provided", () => {
  const token = sign(keys.secretKey, MESSAGE);
  const splitToken = token.split(".");
  const f = uint8ArrayToString(base64UrlDecode(splitToken[2]));
  expect(f.indexOf('"iat":')).toBeGreaterThan(-1);
});

Deno.test("it generates an exp claim if none is provided", () => {
  const token = sign(keys.secretKey, MESSAGE);
  const splitToken = token.split(".");
  const f = uint8ArrayToString(base64UrlDecode(splitToken[2]));
  expect(f.indexOf('"exp":')).toBeGreaterThan(-1);
});

Deno.test("it signs a message", () => {
  const token = sign(keys.secretKey, MESSAGE, {
    addIat: false,
    addExp: false,
  });
  const splitToken = token.split(".");
  expect(splitToken.length).toBe(3);
  expect(splitToken[0]).toBe("v4");
  expect(splitToken[1]).toBe("public");
  expect(
    splitToken[2],
  ).toBe(
    "eyJzdWIiOiJqb2huZG9lIiwiaWF0IjoiMjAyMy0wMS0wOVQxNTozNDo0Ni44NjVaIn3YmulzSdjSqbwRUYM5jnwa3pKM1X95RPDFp0DVuCUQ6kO7i6cqxMiqmLJtxnTdzRHZaKbKL1QfW6KNE33678MA",
  );
});

Deno.test("it does not add iat if addIat is false", () => {
  const token = sign(keys.secretKey, '{"sub":"napoleon"}', {
    addIat: false,
    addExp: false,
  });
  const splitToken = token.split(".");
  expect(splitToken.length).toBe(3);
  expect(splitToken[0]).toBe("v4");
  expect(splitToken[1]).toBe("public");
  const f = base64urlToString(splitToken[2]).split("}")[0] + "}";
  const payload = JSON.parse(f);
  expect(payload.iat).toBeUndefined();
});

Deno.test("it does not add exp if addExp is false", () => {
  const token = sign(keys.secretKey, '{"sub":"napoleon"}', {
    addIat: false,
    addExp: false,
  });
  const splitToken = token.split(".");
  expect(splitToken.length).toBe(3);
  expect(splitToken[0]).toBe("v4");
  expect(splitToken[1]).toBe("public");
  const f = base64urlToString(splitToken[2]).split("}")[0] + "}";
  const payload = JSON.parse(f);
  expect(payload.exp).toBeUndefined();
});

Deno.test("it signs a message that is consistent with panva/paseto", () => {
  const token = sign(PANVA_KEYS.secretKey, PANVA_MESSAGE, {
    addExp: false,
    addIat: false,
  });
  const splitToken = token.split(".");
  expect(splitToken.length).toBe(3);
  expect(splitToken[0]).toBe("v4");
  expect(splitToken[1]).toBe("public");
  expect(token).toBe(PANVA_TOKEN);
});

Deno.test("it signs a message with a footer", () => {
  const footer = "some footer";
  const token = sign(keys.secretKey, MESSAGE, {
    footer,
  });
  const splitToken = token.split(".");
  expect(splitToken.length).toBe(4);
  expect(splitToken[0]).toBe("v4");
  expect(splitToken[1]).toBe("public");
});

Deno.test("it signs a message with a footer and an assertion", () => {
  const footer = "some footer";
  const token = sign(keys.secretKey, MESSAGE, {
    footer,
    assertion: "some assertion",
  });
  const splitToken = token.split(".");
  expect(splitToken.length).toBe(4);
  expect(splitToken[0]).toBe("v4");
  expect(splitToken[1]).toBe("public");
});

//
// Footer
//

Deno.test("it throws if footer is not a string, object or Uint8Array", () => {
  expect(() =>
    sign(keys.secretKey, MESSAGE, {
      footer: 123 as any,
    })
  ).toThrow(TypeError);

  expect(() =>
    sign(keys.secretKey, MESSAGE, {
      footer: true as any,
    })
  ).toThrow(TypeError);

  expect(() =>
    sign(keys.secretKey, MESSAGE, {
      footer: [] as any,
    })
  ).toThrow(TypeError);

  expect(() =>
    sign(keys.secretKey, MESSAGE, {
      footer: null as any,
    })
  ).toThrow(TypeError);
});

Deno.test("it throws if footer contains a wpk or kid claim thats invalid type", () => {
  expect(() =>
    sign(keys.secretKey, MESSAGE, {
      footer: { wpk: 123 } as any,
    })
  ).toThrow(PasetoClaimInvalid);

  expect(() =>
    sign(keys.secretKey, MESSAGE, {
      footer: { kid: 123 } as any,
    })
  ).toThrow(PasetoClaimInvalid);
});

//
// Assertion
//

Deno.test("it throws if assertion is not an object, string or Uint8Array", () => {
  expect(() =>
    sign(keys.secretKey, MESSAGE, {
      assertion: [] as any,
    })
  ).toThrow(TypeError);

  expect(() =>
    sign(keys.secretKey, MESSAGE, {
      assertion: null as any,
    })
  ).toThrow(TypeError);
});
