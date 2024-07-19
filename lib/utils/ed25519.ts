import { ed25519 } from "@noble/curves/ed25519";
import { concat } from "./uint8array.ts";

export function generateKeyPair() {
  const privateKey = ed25519.utils.randomPrivateKey();
  const publicKey = ed25519.getPublicKey(privateKey);
  const secretKey = concat(privateKey, publicKey);
  return {
    secretKey,
    publicKey,
  };
}

export const {
  sign,
  verify,
} = ed25519;
