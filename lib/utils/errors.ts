// Extended from https://github.com/panva/paseto/blob/main/lib/errors.js

/**
 * Error codes
 */
export const CODES = {
  PasetoNotSupported: "ERR_PASETO_NOT_SUPPORTED",
  PasetoDecryptionFailed: "ERR_PASETO_DECRYPTION_FAILED",
  PasetoInvalid: "ERR_PASETO_INVALID",
  PasetoVerificationFailed: "ERR_PASETO_VERIFICATION_FAILED",
  PasetoPayloadInvalid: "ERR_PASETO_PAYLOAD_INVALID",
  PasetoClaimInvalid: "ERR_PASETO_CLAIM_INVALID",
  PasetoPurposeInvalid: "ERR_PASETO_PURPOSE_INVALID",
  PasetoFormatInvalid: "ERR_PASETO_FORMAT_INVALID",
  PasetoKeyInvalid: "ERR_PASETO_KEY_INVALID",
  PasetoTokenInvalid: "ERR_PASETO_TOKEN_INVALID",
  PasetoFooterInvalid: "ERR_PASETO_FOOTER_INVALID",
  PasetoSignatureInvalid: "ERR_PASETO_SIGNATURE_INVALID",
};

/**
 * PasetoError
 */
export class PasetoError extends Error {
  /**
   * Error code
   */
  public code: string;

  /**
   * PasetoError
   * @param message Error message
   */
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    this.code = CODES[this.constructor.name as keyof typeof CODES];
  }
}

/**
 * Thrown when a PASETO version is not supported.
 */
export class PasetoNotSupported extends PasetoError {}

/**
 * Thrown when decryption fails.
 */
export class PasetoDecryptionFailed extends PasetoError {}

/**
 * Thrown when a PASETO token is invalid.
 */
export class PasetoInvalid extends PasetoError {}

/**
 * Thrown when a PASETO token verification fails.
 */
export class PasetoVerificationFailed extends PasetoError {}

/**
 * Thrown when a PASETO payload is invalid.
 */
export class PasetoPayloadInvalid extends PasetoError {}

/**
 * Thrown when a PASETO claim is invalid.
 */
export class PasetoClaimInvalid extends PasetoError {}

/**
 * Thrown when a PASETO purpose is invalid.
 */
export class PasetoPurposeInvalid extends PasetoError {}

/**
 * Thrown when a PASETO format is invalid.
 */
export class PasetoFormatInvalid extends PasetoError {}

/**
 * Thrown when a PASETO key is invalid.
 */
export class PasetoKeyInvalid extends PasetoError {}

/**
 * Thrown when a PASETO token is invalid.
 */
export class PasetoTokenInvalid extends PasetoError {}

/**
 * Thrown when a PASETO footer is invalid.
 */
export class PasetoFooterInvalid extends PasetoError {}

/**
 * Thrown when a PASETO signature is invalid.
 */
export class PasetoSignatureInvalid extends PasetoError {}
