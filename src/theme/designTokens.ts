/**
 * Centralised MEBT (መብት) F1 Design Tokens
 * Single source of truth mirroring CSS custom properties in src/index.css.
 * Derived from approved DESIGN_SPEC.md and F1_reference.png.
 */

export const MEBT_TOKENS = {
  brand: {
    name: 'MEBT',
    ethiopicName: 'መብት',
    concept: 'F1',
  },
  colors: {
    light: {
      primaryBlue: '#075DEB',
      primaryBlueHover: '#0547B8',
      primaryBlueSoft: '#EBF2FF',
      accentAmber: '#FFB300',
      accentAmberText: '#8A5300',
      accentAmberSoft: '#FFF7E0',
      deepNavy: '#09234F',
      iceBackground: '#F5F8FF',
      cardSurface: '#FFFFFF',
      border: '#DCE6F7',
      mutedText: '#4A5D7A',
    },
    dark: {
      primaryBlue: '#4D8EFF',
      primaryBlueHover: '#2F75F5',
      primaryBlueSoft: '#132544',
      accentAmber: '#FFB300',
      accentAmberText: '#FFD166',
      accentAmberSoft: '#2A210D',
      deepNavy: '#F1F5FF',
      iceBackground: '#081224',
      cardSurface: '#0F1D36',
      border: '#1E3254',
      mutedText: '#A9B9D4',
    },
  },
  typography: {
    headingFont: "'Manrope', 'Noto Sans Ethiopic', system-ui, -apple-system, sans-serif",
    bodyFont: "'Inter', 'Noto Sans Ethiopic', system-ui, -apple-system, sans-serif",
    scales: {
      standard: '16px',
      large: '18px',
      xlarge: '20px',
    },
  },
  spacing: {
    baseUnitPx: 4,
    cardPaddingMobile: '20px',
    cardPaddingDesktop: '24px',
    sectionGap: '24px',
  },
  radii: {
    control: '12px',
    button: '16px',
    card: '24px',
  },
  accessibility: {
    minTouchTargetPx: 44,
    wcagContrastMinimum: 4.5,
  },
  motion: {
    fadeInMs: 180,
    sheetUpMs: 220,
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
  },
} as const;

export type MebtDesignTokens = typeof MEBT_TOKENS;
