/** Normalizes English and Tamil text without altering Unicode letters or marks. */
export function normalizeInput(text: string, _language: 'en' | 'ta'): string {
  return text
    .normalize('NFC')
    .toLocaleLowerCase()
    .replace(/\s+/gu, ' ')
    .trim()
    .replace(/^[\p{P}]+|[\p{P}]+$/gu, '')
    .replace(/\s+[\p{P}]+(?=\s|$)/gu, '')
    .trim();
}
