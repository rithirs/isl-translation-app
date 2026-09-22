/** Normalizes cosmetic variants into the uppercase database key format. */
export function normalizeInput(text: string): string {
  return text
    .normalize('NFC')
    .trim()
    .toLocaleUpperCase()
    .replace(/\s+/gu, ' ')
    .replace(/[!?"'`]/gu, '')
    .replace(/\.+$/gu, '')
    .trim();
}
