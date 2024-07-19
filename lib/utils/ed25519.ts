import { ed25519 } from "@noble/curves/ed25519";
import { concat } from "./uint8array.ts";

/**
 * Private (secret) and public key pair
 */
export interface KeyPair {
  secretKey: Uint8Array;
  publicKey: Uint8Array;
}

/**
 * Generates a public/private key pair
 * the secret key is the concatenation of the private key and the public key
 * Noble crypto expects just the private key, but PASETO format uses both
 * The ed25519Sign provided slices the secret key for you already
 * @returns {KeyPair} A new key pair
 */
export function generateKeyPair(): KeyPair {
  const privateKey = ed25519.utils.randomPrivateKey();
  const publicKey = ed25519.getPublicKey(privateKey);
  const secretKey = concat(privateKey, publicKey);
  return {
    secretKey,
    publicKey,
  };
}
/**
 * Signs a message using the Ed25519 algorithm
 * @param message
 * @param privateKey
 * @returns
 */
export const ed25519Sign: typeof ed25519.sign = (
  message,
  privateKey,
) =>
  ed25519.sign(
    message,
    privateKey.slice(0, 32),
  );
/**
 * Verifies a message using the Ed25519 algorithm
 * @param signature
 * @param message
 * @param publicKey
 */
export const ed25519Verify: typeof ed25519.verify = (
  signature,
  message,
  publicKey,
) => ed25519.verify(signature, message, publicKey);
