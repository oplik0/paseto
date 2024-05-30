import { PasetoFormatInvalid, PasetoPurposeInvalid } from "../utils/errors.ts";
import { concat, stringToUint8Array } from "../utils/uint8array.ts";

import { base64UrlEncode } from "../utils/base64url.ts";
import { generateKeyPair } from "@stablelib/ed25519";

/**
 * Public key pair with secret key and public key as strings
 */
export interface PASERKPublicKeyPair {
  /**
   * Secret key
   */
  secretKey: string;
  /**
   * Public key
   */
  publicKey: string;
}

/**
 * Public key pair with secret key and public key as Uint8Array
 */
export interface PASERKPublicKeyPairBuffer {
  /**
   * Secret key
   */
  secretKey: Uint8Array;
  /**
   * Public key
   */
  publicKey: Uint8Array;
}

/**
 * Generates a secret key (`local` purpose) or key pair (`public` purpose).
 * The keys are scoped to the purpose and version of PASETO; when parsing a token, the key must be
 * the same purpose and version as the token. This prevents a `v4.public` key from being used to
 * parse a `v4.local` token or vice versa.
 *
 * To use the generated key(s) in another PASETO implementation, specify the format as `paserk`.
 * @param {string} purpose `local` (encrypt/decrypt) or `public` (sign/verify)
 * @param {object} options Options
 * @param {string} options.format Format of the returned key(s) (`paserk` (PASERK) or `buffer` (Uint8Array)); defaults to `paserk`
 * @returns {string | Uint8Array | PASERKPublicKeyPair | PASERKPublicKeyPairBuffer} Private and public key pair for `public` purpose, secret key for `local` purpose
 * @see https://github.com/paseto-standard/paseto-spec/blob/master/docs/02-Implementation-Guide/03-Algorithm-Lucidity.md#paseto-cryptography-key-requirements
 */
export function generateKeys(
  purpose: "local",
  opts?: { format?: "paserk" },
): string;

/**
 * Generates a secret key (`local` purpose) or key pair (`public` purpose).
 * @param purpose local
 * @param opts format
 */
export function generateKeys(
  purpose: "local",
  opts?: { format?: "buffer" },
): Uint8Array;

/**
 * Generates a secret key (`local` purpose) or key pair (`public` purpose).
 * @param purpose public
 * @param opts format
 */
export function generateKeys(
  purpose: "public",
  opts?: { format?: "paserk" },
): PASERKPublicKeyPair;

/**
 * Generates a secret key (`local` purpose) or key pair (`public` purpose).
 * @param purpose public
 * @param opts format
 */
export function generateKeys(
  purpose: "public",
  opts?: { format?: "buffer" },
): PASERKPublicKeyPairBuffer;

/**
 * Generates a secret key (`local` purpose) or key pair (`public` purpose).
 * @param purpose local
 * @param opts format
 */
export function generateKeys(
  purpose: "local" | "public",
  opts: {
    format?: "paserk" | "buffer" | undefined;
  } = { format: "paserk" },
): string | Uint8Array | PASERKPublicKeyPair | PASERKPublicKeyPairBuffer {
  let ret;
  const format = opts?.format ?? "paserk";

  switch (purpose) {
    case "local": {
      // For local keys, we generate a random 32-byte key
      const random = crypto.getRandomValues(new Uint8Array(32));
      if (random === null) {
        throw new Error(
          "getRandomValues returned an invalid length Uint8Array",
        );
      }
      switch (format) {
        case "paserk": {
          ret = `k4.local.${base64UrlEncode(random)}`;
          break;
        }
        case "buffer": {
          ret = concat(stringToUint8Array("k4.local."), random);
          break;
        }
        default: {
          throw new PasetoFormatInvalid(`Invalid format: ${format}`);
        }
      }
      break;
    }
    case "public": {
      // For public keys, we generate an Ed25519 key pair
      const keyPair = generateKeyPair();
      switch (format) {
        case "paserk": {
          ret = {
            secretKey: `k4.secret.${base64UrlEncode(keyPair.secretKey)}`,
            publicKey: `k4.public.${base64UrlEncode(keyPair.publicKey)}`,
          };
          break;
        }
        case "buffer": {
          ret = {
            secretKey: concat(
              stringToUint8Array("k4.secret."),
              keyPair.secretKey,
            ),
            publicKey: concat(
              stringToUint8Array("k4.public."),
              keyPair.publicKey,
            ),
          };
          break;
        }
        default: {
          throw new PasetoFormatInvalid(`Invalid format: ${format}`);
        }
      }
      break;
    }
    default: {
      throw new PasetoPurposeInvalid(`Invalid purpose: ${purpose}`);
    }
  }

  return ret;
}
