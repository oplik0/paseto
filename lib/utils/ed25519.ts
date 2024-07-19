import { ed25519 } from "@noble/curves/ed25519";
import { concat } from "./uint8array.ts";

export interface KeyPair {
  secretKey: Uint8Array;
  publicKey: Uint8Array;
}

export function generateKeyPair(): KeyPair {
  const privateKey = ed25519.utils.randomPrivateKey();
  const publicKey = ed25519.getPublicKey(privateKey);
  const secretKey = concat(privateKey, publicKey);
  return {
    secretKey,
    publicKey,
  };
}
export const sign = ed25519.sign;
export const verify = ed25519.verify;
