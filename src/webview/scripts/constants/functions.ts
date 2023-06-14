/**
 * Converts a hex string to a utf8 string.
 * The hex string must be an even number of bytes, and each byte must be a
 * valid hexadecimal digit (0-9, a-f, A-F).
 *
 * @example hexToUtf8("0x48656c6c6f20576f726c6421") // "Hello World!"
 */
export function hexToUtf8(hex: string) {
  // Ensure we have an even number of characters in the string.
  if (hex.length % 2 !== 0) {
    throw new Error("Invalid hex string");
  }

  // Split the string into an array of bytes.
  const bytes = hex.match(/.{1,2}/g);
  if (!bytes) {
    throw new Error("Invalid hex string");
  }

  // Convert each byte into a code point.
  return bytes
    .map((byte) => {
      const codePoint = parseInt(byte, 16);
      return String.fromCharCode(codePoint);
    })
    .join("");
}
