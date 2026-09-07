export type NativeRevision2ValidationResult =
  | { ok: true; value: Record<string, unknown> }
  | { ok: false; errors: readonly string[] }

export function validateNativeV2Bundle(
  bundle: unknown,
  options?: Record<string, unknown>,
): NativeRevision2ValidationResult

export function validateNativeV2ReceiptValue(value: unknown): readonly string[]

export function canonicalDigest(value: unknown): string
