/** Normalizes cosmetic variants without changing Tamil or other Unicode letters. */
export function normalizeInput(text: string): string {
  return text
    .normalize('NFC')
    .trim()
    .toLocaleLowerCase()
    .replace(/\s+/gu, ' ')
    .replace(/[!?"'`]/gu, '')
    .replace(/\.+$/gu, '')
    .trim();
}
