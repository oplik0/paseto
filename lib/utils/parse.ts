import {
  AUTH_BYTES,
  KEY_BYTES,
  KEY_LENGTHS,
  KEY_MAGIC_BYTES,
  KEY_MAGIC_STRINGS,
} from "./magic.ts";
import type { Assertion, Footer, Payload } from "./types.ts";
import {
  PasetoClaimInvalid,
  PasetoKeyInvalid,
  PasetoPayloadInvalid,
  PasetoPurposeInvalid,
  PasetoTokenInvalid,
} from "./errors.ts";
import {
  concat,
  stringToUint8Array,
  uint8ArrayToString,
} from "./uint8array.ts";
import {
  constantTimeEqual,
  isObject,
  validateFooterClaims,
  validateISODate,
} from "./validate.ts";
import { parseTime } from "./time.ts";

import { assertJsonStringSize } from "./json.ts";
import { base64UrlDecode } from "./base64url.ts";
import { blake2b } from "@noble/hashes/blake2b";

/**
 * Parses a key and ensures it is a valid key for the given type
 * @param {string} purpose Purpose of the key. Must be one of `local`, `secret` or `public`.
 * @param {string | Uint8Array} key Key to parse. **Must contain the magic string (or bytes) for the given purpose.**
 * @returns {Uint8Array} Parsed key
 * @see https://github.com/paseto-standard/paseto-spec/blob/master/docs/02-Implementation-Guide/03-Algorithm-Lucidity.md
 */
export function parseKeyData(
  purpose: "local" | "secret" | "public",
  key: string | Uint8Array,
  { version = "v4" }: { version?: "v4" } = { version: "v4" },
): Uint8Array {
  const magicString = KEY_MAGIC_STRINGS[version][purpose];
  const magicBytes = KEY_MAGIC_BYTES[version][purpose];

  // Assert that the key and purpose are valid
  if (!purpose || !key) throw new TypeError("Purpose and key are required.");

  if (typeof key !== "string" && key instanceof Uint8Array === false) {
    throw new PasetoKeyInvalid(
      `Invalid key data. Key data must be a string or Uint8Array and start with the UTF-8 string '${magicString}' for this purpose (${purpose}). Received: ${typeof key}.`,
    );
  }

  if (purpose !== "local" && purpose !== "secret" && purpose !== "public") {
    throw new PasetoPurposeInvalid(
      `Invalid purpose. Must be one of 'local', 'secret' or 'public'. Received: ${purpose}`,
    );
  }

  if (typeof key === "string") {
    if (key.startsWith(KEY_MAGIC_STRINGS[version][purpose]) === false) {
      throw new PasetoKeyInvalid(
        `Invalid key (string). Key must start with ${magicString} to ensure it is a valid key for the given purpose. Received: ${key}`,
      );
    }

    // Decode the key
    key = base64UrlDecode(key.split(".")[2]);
  } else {
    if (!constantTimeEqual(key.subarray(0, 9), magicBytes)) {
      throw new PasetoKeyInvalid(
        `Invalid key. Key must start with the UTF-8 bytes ${magicBytes.toString()} to ensure it is a valid key for the given purpose.`,
      );
    }

    // Remove the magic bytes
    key = key.subarray(9);
  }

  // Validate key length
  if (key.byteLength !== KEY_LENGTHS[version][purpose]) {
    throw new PasetoKeyInvalid(
      `Invalid key. Key must be ${KEY_LENGTHS[version][purpose]} bytes long.`,
    );
  }

  return key;
}

/**
 * Splits a PASETO v4.public token into its parts
 * @param {string | Uint8Array} token Token to split
 * @returns {object} Object containing the token parts
 */
export function parsePublicToken(token: string | Uint8Array): {
  payload: Uint8Array;
  message: Uint8Array;
  signature: Uint8Array;
  footer: Uint8Array;
} {
  if (token instanceof Uint8Array) {
    token = uint8ArrayToString(token);
  }
  const parts = token.split(".");

  // v4.public.payload.[footer]
  if (parts.length > 4) {
    throw new PasetoTokenInvalid(
      `Invalid token format: must contain 3 or 4 parts (is ${parts.length})`,
    );
  }

  const payload = base64UrlDecode(parts[2]);

  if (payload.length < 64) {
    throw new PasetoTokenInvalid(
      `Invalid token format: payload must be at least 64 bytes (is ${payload.length})`,
    );
  }

  const footer = parts[3] ? base64UrlDecode(parts[3]) : new Uint8Array(0);
  const message = payload.subarray(0, -64);
  const signature = payload.subarray(-64);

  return {
    payload,
    message,
    signature,
    footer,
  };
}

/**
 * Splits a PASETO v4.secret token into its parts
 * @param {string | Uint8Array} token Token to split
 * @returns {object} Object containing the token parts
 */
export function parseLocalToken(token: string | Uint8Array): {
  payload: Uint8Array;
  nonce: Uint8Array;
  tag: Uint8Array;
  ciphertext: Uint8Array;
  footer: Uint8Array;
} {
  if (token instanceof Uint8Array) {
    token = uint8ArrayToString(token);
  }
  const parts = token.split(".");

  // v4.local.payload.[footer]
  if (parts.length > 4) {
    throw new PasetoTokenInvalid(
      `Invalid token format: must contain 3 or 4 parts (is ${parts.length})`,
    );
  }

  const payload = base64UrlDecode(parts[2]);

  if (payload.length < 32) {
    throw new PasetoTokenInvalid(
      `Invalid token format: payload must be at least 32 bytes (is ${payload.length})`,
    );
  }

  const footer = parts[3] ? base64UrlDecode(parts[3]) : new Uint8Array(0);

  // Decode the payload (m sans h, f, and the optional trailing period between m and f) from base64url to raw binary. Set:
  // n to the leftmost 32 bytes
  // t to the rightmost 32 bytes
  // c to the middle remainder of the payload, excluding n and t.
  const nonce = payload.slice(0, 32);
  const tag = payload.slice(-32);
  const ciphertext = payload.slice(32, -32);

  return {
    payload,
    nonce,
    tag,
    ciphertext,
    footer,
  };
}

/**
 * Parse and validate the payload of a message
 * @param {string | object | Uint8Array} obj Payload to validate
 * @see https://github.com/paseto-standard/paseto-spec/blob/master/docs/02-Implementation-Guide/01-Payload-Processing.md#payload-processing
 */
export function parsePayload(payload: string | Payload | Uint8Array, {
  addIat = true, // Add an iat claim if one is not provided
  addExp = true, // Add an exp claim if one is not provided:
  maxDepth = 32, // Maximum depth of the JSON object
  maxKeys = 128, // Maximum number of keys in the JSON object
  validate = true, // Validate the payload
}: {
  addIat?: boolean;
  addExp?: boolean;
  maxDepth?: number;
  maxKeys?: number;
  validate?: boolean;
} = {
  addIat: true,
  addExp: true,
  maxDepth: 32,
  maxKeys: 128,
  validate: true,
}): Payload {
  let obj;

  // Bail out early
  if (
    !isObject(payload) &&
    typeof payload !== "string" &&
    !(payload instanceof Uint8Array)
  ) {
    throw new PasetoPayloadInvalid("Payload must be valid JSON (is falsy)");
  }

  // All PASETO payloads must be a JSON-encoded object represented as a UTF-8 encoded string.
  const possibleStringPayload = payload instanceof Uint8Array
    ? uint8ArrayToString(payload)
    : payload;

  if (typeof possibleStringPayload === "string") {
    // The topmost JSON object should be an object, not a flat array or list.
    // Bail out early if the payload is a list.
    if (
      possibleStringPayload.startsWith("[") ||
      possibleStringPayload.startsWith("[")
    ) {
      throw new PasetoPayloadInvalid(
        "Payload must be valid JSON (is an array)",
      );
    }
    // Try to parse the payload as JSON.
    try {
      assertJsonStringSize(possibleStringPayload, {
        maxDepth,
        maxKeys,
      });
      obj = JSON.parse(possibleStringPayload);
    } catch (_err) {
      throw new PasetoPayloadInvalid("Payload must be valid JSON");
    }
  } else if (isObject(payload)) {
    obj = JSON.parse(JSON.stringify(payload));
  }

  // Validate the "iss" claim
  if (Object.hasOwn(obj, "iss") && validate) {
    const iss = obj.iss;
    if (typeof iss !== "string") {
      throw new PasetoClaimInvalid(
        'Payload must have a valid "iss" claim (is not a string)',
      );
    }
  }

  // Validate the "sub" claim
  if (Object.hasOwn(obj, "sub") && validate) {
    const sub = obj.sub;
    if (typeof sub !== "string") {
      throw new PasetoClaimInvalid(
        'Payload must have a valid "sub" claim (is not a string)',
      );
    }
  }

  // Validate the "aud" claim
  if (Object.hasOwn(obj, "aud") && validate) {
    const aud = obj.aud;
    if (typeof aud !== "string") {
      throw new PasetoClaimInvalid(
        'Payload must have a valid "aud" claim (is not a string)',
      );
    }
  }

  // Note the order here: iat comes first, then exp, then nbf.
  // This is because the exp claim is validated against the iat claim,
  // and the nbf claim is validated against the exp and iat claims.
  // Checking them in this order ensures that if any of the claims are
  // not valid (e.g. iat is in the future, or not a valid JSON string),
  // it will bail out early and not attempt to validate the other claims.

  const now = Date.now();

  // Validate the "iat" claim
  if (Object.hasOwn(obj, "iat") && validate) {
    // Validate the existing "iat" claim.
    // Don't allow passing in a relative time string (e.g. "1 hour")
    const iat = obj.iat;
    if (!validateISODate(iat)) {
      throw new PasetoClaimInvalid(
        'Payload must have a valid "iat" claim (is not an ISO date)',
      );
    }
    const parsedDate = Date.parse(iat);
    // The "iat" claim must not be in the future
    if (parsedDate > now) {
      throw new PasetoClaimInvalid(
        'Payload must have a valid "iat" claim (is in the future)',
      );
    }
  } else if (addIat) {
    // If the "iat" claim is not present, create it if requested
    obj.iat = new Date().toISOString();
  }

  // Validate the "exp" claim
  if (Object.hasOwn(obj, "exp") && validate) {
    let exp = obj.exp;
    try {
      exp = parseTime(exp);
    } catch (_err) {
      throw new PasetoClaimInvalid(
        'Payload must have a valid "exp" claim (is not an date or a valid relative time string (e.g. "1 hour"))',
      );
    }
    // The "exp" claim must be greater than the "iat" claim
    if (Object.hasOwn(obj, "iat") && exp <= Date.parse(obj.iat)) {
      throw new PasetoClaimInvalid(
        'Payload must have a valid "exp" claim (is not greater than "iat")',
      );
    }
    // The "exp" claim must not have expired
    if (exp <= now) {
      throw new PasetoClaimInvalid(
        'Payload must have a valid "exp" claim (has expired)',
      );
    }
    // If the "exp" claim is not a valid ISO date, convert it to one
    if (!validateISODate(obj.exp)) {
      obj.exp = new Date(exp).toISOString();
    }
  } else if (addExp) {
    // If the "exp" claim is not present, create it with one hour of leeway
    obj.exp = new Date(now + 3600000).toISOString();
  }

  // Validate the "nbf" claim
  if (Object.hasOwn(obj, "nbf") && validate) {
    let nbf = obj.nbf;
    try {
      nbf = parseTime(nbf);
    } catch (_err) {
      throw new PasetoClaimInvalid(
        'Payload must have a valid "nbf" claim (is not an date or a valid relative time string (e.g. "1 hour"))',
      );
    }
    // The "nbf" claim must be greater than the "iat" claim
    if (Object.hasOwn(obj, "iat") && nbf < Date.parse(obj.iat)) {
      throw new PasetoClaimInvalid(
        'Payload must have a valid "nbf" claim (is not greater than "iat")',
      );
    }
    // The "nbf" claim must not be in the future
    if (nbf > now) {
      throw new PasetoClaimInvalid(
        'Payload must have a valid "nbf" claim (is in the future)',
      );
    }
    // If the "nbf" claim is not a valid ISO date, convert it to one
    if (!validateISODate(obj.nbf)) {
      obj.nbf = new Date(nbf).toISOString();
    }
  }

  // Validate the "jti" claim
  if (Object.hasOwn(obj, "jti") && validate) {
    const jti = obj.jti;
    if (typeof jti !== "string") {
      throw new PasetoClaimInvalid(
        'Payload must have a valid "jti" claim (is not a string)',
      );
    }
  }

  return obj as Payload;
}

/**
 * Assert that the footer is a Uint8Array. Parses a string footer into a Uint8Array.
 * If the footer is JSON, the `kid` and `wpk` claims will be validated.
 * @param {Footer | string | Uint8Array} footer The footer to assert.
 * @returns {Uint8Array} footer as a Uint8Array.
 * @see https://github.com/paseto-standard/paseto-spec/blob/master/docs/02-Implementation-Guide/04-Claims.md#optional-footer-claims
 */
export function parseFooter(
  footer: Footer | string | Uint8Array,
  { maxDepth = 32, maxKeys = 128, validate = true }: {
    maxDepth?: number;
    maxKeys?: number;
    validate?: boolean;
  } = { maxDepth: 32, maxKeys: 128, validate: true },
): Uint8Array {
  if (typeof footer === "string") {
    // Check if the footer is JSON
    if (footer.startsWith("{") && footer.endsWith("}")) {
      assertJsonStringSize(footer, {
        maxDepth,
        maxKeys,
      });
      const obj = JSON.parse(footer);
      if (validate) validateFooterClaims(obj);
    }
    return stringToUint8Array(footer);
  } else if (isObject(footer)) {
    if (validate) validateFooterClaims(footer as Footer);
    return stringToUint8Array(JSON.stringify(footer));
  } else if (footer instanceof Uint8Array) {
    const possibleObj = uint8ArrayToString(footer);
    if (possibleObj.startsWith("{") && possibleObj.endsWith("}") && validate) {
      assertJsonStringSize(possibleObj, {
        maxDepth,
        maxKeys,
      });
      const obj = JSON.parse(possibleObj);
      validateFooterClaims(obj);
    }
    return footer;
  }
  throw new TypeError("Footer must be a string, Uint8Array, or object");
}

/**
 * Assert that the assertion is a Uint8Array. Parses a string assertion into a Uint8Array.
 * @param {Assertion | string | Uint8Array} assertion The assertion to assert.
 * @returns {Uint8Array} assertion as a Uint8Array.
 */
export function parseAssertion(
  assertion: Assertion | string | Uint8Array,
): Uint8Array {
  if (typeof assertion === "string") {
    return stringToUint8Array(assertion);
  } else if (assertion instanceof Uint8Array) {
    return assertion;
  } else if (isObject(assertion)) {
    return stringToUint8Array(JSON.stringify(assertion));
  }
  throw new TypeError("Assertion must be a string or Uint8Array");
}

/**
 * Derives an encryption key, counter nonce, and auth key from a key and nonce.
 * @param {Uint8Array} key Local key.
 * @param {Uint8Array} nonce Local nonce.
 * @returns {object} Encryption and auth keys.
 */
export function deriveEncryptionAndAuthKeys(
  key: Uint8Array,
  nonce: Uint8Array,
): {
  encryptionKey: Uint8Array;
  counterNonce: Uint8Array;
  authKey: Uint8Array;
} {
  const keyedHash = blake2b(concat(KEY_BYTES, nonce), { key, dkLen: 56 });
  const encryptionKey = keyedHash.slice(0, 32);
  const counterNonce = keyedHash.slice(32);
  const authKey = blake2b(concat(AUTH_BYTES, nonce), { key, dkLen: 32 });

  return {
    encryptionKey,
    counterNonce,
    authKey,
  };
}
