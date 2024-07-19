import type { Assertion, Footer, Payload } from "../utils/types.ts";
import {
  MAX_DEPTH_DEFAULT,
  MAX_KEYS_DEFAULT,
  TOKEN_MAGIC_BYTES,
  TOKEN_MAGIC_STRINGS,
} from "../utils/magic.ts";
import { concat, payloadToUint8Array } from "../utils/uint8array.ts";
import {
  deriveEncryptionAndAuthKeys,
  parseAssertion,
  parseFooter,
  parsePayload,
} from "../utils/parse.ts";

import { PAE } from "../utils/pae.ts";
import { base64UrlEncode } from "../utils/base64url.ts";
import { blake2b } from "@noble/hashes/blake2b";
import { parseKeyData } from "../utils/parse.ts";
import { xchacha20 } from "@noble/ciphers/chacha";

/**
 * Encrypts a payload using a local key and returns a PASETO v4.local token
 * The key must have the version and purpose of `k4.local`.
 * @param {string | Uint8Array} key 32 bytes of data from a random source. Must be prepended with `k4.local.` before use.
 * @param {Payload | string | Uint8array} payload Payload to encrypt
 * @param {object} options Options
 * @param {Footer | string | Uint8Array} options.footer Optional footer
 * @param {Assertion | string | Uint8Array} options.assertion Optional assertion
 * @param {number} options.maxDepth Maximum depth of nested objects in the payload and footer; defaults to 32
 * @param {number} options.maxKeys Maximum number of keys in an object in the payload and footer; defaults to 128
 * @returns {string} PASETO v4.local token
 * @see https://github.com/paseto-standard/paseto-spec/blob/master/docs/01-Protocol-Versions/Version4.md#encrypt
 */
export function encrypt(
  key: string | Uint8Array,
  payload: Payload | string | Uint8Array,
  {
    footer = new Uint8Array(0),
    assertion = new Uint8Array(0),
    addIat = true,
    addExp = true,
    maxDepth = MAX_DEPTH_DEFAULT,
    maxKeys = MAX_KEYS_DEFAULT,
    validatePayload = true,
  }: {
    footer?: Footer | string | Uint8Array;
    assertion?: Assertion | string | Uint8Array;
    addIat?: boolean;
    addExp?: boolean;
    maxDepth?: number;
    maxKeys?: number;
    validatePayload?: boolean;
  } = {
    footer: new Uint8Array(0),
    assertion: new Uint8Array(0),
    addIat: true,
    addExp: true,
    maxDepth: MAX_DEPTH_DEFAULT,
    maxKeys: MAX_KEYS_DEFAULT,
    validatePayload: true,
  },
): string {
  // Assert that key is intended for use with v4.local tokens and has a length of 256 bits (32 bytes)
  key = parseKeyData("local", key);

  const payloadUint8 = payloadToUint8Array(parsePayload(payload, {
    addExp: !!addExp,
    addIat: !!addIat,
    maxDepth,
    maxKeys,
    validate: !!validatePayload,
  }));

  const footerUint8 = parseFooter(footer, {
    maxDepth,
    maxKeys,
    validate: !!validatePayload,
  });

  // Assert assertion is a string or Uint8Array
  assertion = parseAssertion(assertion);

  // Generate 32 random bytes from the OS's CSPRNG
  const nonce = crypto.getRandomValues(new Uint8Array(32));

  // Derive encryption and authentication keys from the key and nonce
  const { encryptionKey, counterNonce, authKey } = deriveEncryptionAndAuthKeys(
    key,
    nonce,
  );

  // Encrypt the message using XChaCha20
  const ciphertext = xchacha20(
    encryptionKey,
    counterNonce,
    payloadUint8,
    new Uint8Array(payloadUint8.length),
  );

  // Pack header, nonce, ciphertext, footer, and assertion together using PAE
  const preAuth = PAE(
    TOKEN_MAGIC_BYTES.v4.local,
    nonce,
    ciphertext,
    footerUint8,
    assertion as Uint8Array,
  );

  // Calculate BLAKE2b-MAC of the output of preAuth using Ak as the authentication key
  const tag = blake2b(preAuth, { key: authKey, dkLen: 32 });

  // If footer is empty, return header || base64url(nonce || ciphertext || t)
  // Otherwise, return header || base64url(nonce || ciphertext || t) || . || base64url(footer)
  return footer.length === 0
    ? `${TOKEN_MAGIC_STRINGS.v4.local}${
      base64UrlEncode(concat(nonce, ciphertext, tag))
    }`
    : `${TOKEN_MAGIC_STRINGS.v4.local}${
      base64UrlEncode(concat(nonce, ciphertext, tag))
    }.${base64UrlEncode(footerUint8)}`;
}
