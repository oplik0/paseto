/**
 * @module v4
 *
 * PASETO v4 implementation
 *
 * @example
 * ```ts
 * import { sign, generateKeys } from "@opliko/paseto/v4";
 *
 * // generate a key pair
 * const { secretKey, publicKey } = generateKeys("public");
 * // sign a payload
 * try {
 *   const token = await sign(
 *      secretKey, // string | Uint8Array
 *      // payload = { sub: '1234567890', name: 'John Doe' }
 *      payload, // Payload | string | Uint8Array
 *      {
 *      // Optional: If footer parses to an object, its `kid` and `wpk` claims will be validated.
 *      footer, // Footer | string | Uint8Array
 *      // Optional: Assertion is a JSON.stringifyable object, string or buffer.
 *      assertion, // Assertion | string | Uint8Array
 *      // Optional: If true, a default `exp` claim of 1 hour will be added to the payload.
 *      addExp, // boolean; defaults to true
 *      // Optional: If true, a default `iat` claim of the current time will be added to the payload.
 *      addIat, // boolean; defaults to true
 *      // Optional: Maximum depth of the JSON in the payload and footer objects (if footer parses to an object)
 *      maxDepth, // number; defaults to 32. 0 to disable
 *      // Optional: Maximum number of keys in the payload and footer objects (if footer parses to an object)
 *      maxKeys, // number; defaults to 128. 0 to disable
 *      // Optional: If true, the payload will be validated against the registered claims.
 *      validatePayload, // boolean; defaults to true
 *      },
 *  );
 *  // token: v4.public.xxx..
 *  } catch (err) {
 *    // err: Error
 *  }
 */
import { decrypt } from "./decrypt.ts";
import { encrypt } from "./encrypt.ts";
import { generateKeys } from "./key.ts";
import { sign } from "./sign.ts";
import { verify } from "./verify.ts";

export { decrypt, encrypt, generateKeys, sign, verify };
