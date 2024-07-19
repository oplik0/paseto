/**
 * Paseto purpose
 */
export type PasetoPurpose = "local" | "public";

/**
 * Paseto version
 */
export type Assertion =
  | {
    [key: string]: object | string;
  }
  | string
  | Uint8Array;

/**
 * Paseto payload
 */
export type Payload = {
  [key: string]: string | undefined;
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
  [key: string]: string | undefined;
  kid?: string;
  wpk?: string;
};
