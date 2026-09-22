/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    // Legacy aliases (kept for backward compatibility)
    text: '#0F3D3E',
    tint: '#0F3D3E',

    // Core surfaces
    background: '#FAF8F5',
    foreground: '#1E293B',

    // Cards / elevated surfaces
    card: '#FFFFFF',
    cardForeground: '#0F3D3E',

    // Primary action color (buttons, links, active states)
    primary: '#0F3D3E',
    primaryForeground: '#ffffff',

    // Secondary / less-emphasis interactive surfaces
    secondary: '#F0EAE2',
    secondaryForeground: '#0F3D3E',

    // Muted / subdued elements (dividers, timestamps, placeholders)
    muted: '#F0EAE2',
    mutedForeground: '#64748B',

    // Accent highlights (badges, selected items, focus rings)
    accent: '#F2E6D8',
    accentForeground: '#0F3D3E',

    // Destructive actions (delete, error states)
    destructive: '#A85C4A',
    destructiveForeground: '#ffffff',

    // Borders and input outlines
    border: '#E7DED5',
    input: '#E7DED5',
  },
  dark: {
    text: '#F8F4EF',
    tint: '#D8A17A',
    background: '#102D2E',
    foreground: '#F8F4EF',
    card: '#173C3D',
    cardForeground: '#F8F4EF',
    primary: '#D8A17A',
    primaryForeground: '#102D2E',
    secondary: '#24494A',
    secondaryForeground: '#F8F4EF',
    muted: '#24494A',
    mutedForeground: '#B8C0C2',
    accent: '#5D4A41',
    accentForeground: '#F8F4EF',
    destructive: '#D48672',
    destructiveForeground: '#102D2E',
    border: '#31595A',
    input: '#31595A',
  },

  // Border radius (in px). Sync from the sibling web artifact's --radius
  // CSS variable. This value applies to cards, buttons, inputs, and modals.
  radius: 22,
};

export default colors;
