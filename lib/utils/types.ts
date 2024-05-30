/**
 * Paseto purpose
 */
export type PasetoPurpose = "local" | "public";

/**
 * Paseto version
 */
export type Assertion =
  | {
    [key: string]: any;
  }
  | string
  | Uint8Array;

/**
 * Paseto payload
 */
export type Payload = {
  [key: string]: any;
  iss?: string;
  sub?: string;
  aud?: string;
  exp?: string;
  nbf?: string;
  jti?: string;
  iat?: string;
};

/**
 * Paseto footer
 */
export type Footer = {
  [key: string]: any;
  kid?: string;
  wpk?: string;
};
