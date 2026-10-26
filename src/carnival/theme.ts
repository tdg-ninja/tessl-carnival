/**
 * The carnival's colours, fonts and sizes. Games draw with these rather than
 * their own values, so every booth on the midway looks like it belongs.
 */
export const theme = {
  // A horror-carnival poster: near-black and charcoal, bone white, crimson
  // stripes, a grape accent and soda-green highlights.
  colors: {
    background: '#0e0c11',
    surface: '#26222b',
    text: '#f3ecdc',
    muted: '#bcb2c8',
    accent: '#46f26a',
    danger: '#ff3355',
    stripeA: '#c8102e',
    stripeB: '#f3ecdc',
    water: '#3fd0ff',
    wood: '#9a6844',
    grape: '#8a3fd1',
  },
  font: {
    // Heavy poster type for canvas text and headings, all local system fonts.
    family: 'Impact, Haettenschweiler, "Arial Narrow Bold", "Franklin Gothic Bold", sans-serif',
    // Readable type for longer HTML text.
    textFamily: '"Trebuchet MS", "Segoe UI", system-ui, sans-serif',
    small: 14,
    body: 18,
    title: 32,
  },
  radius: 4,
  canvas: {
    width: 800,
    height: 500,
  },
} as const;

/** Canvas font string, e.g. canvasFont('title') → 'bold 32px Impact, …'. */
export function canvasFont(size: 'small' | 'body' | 'title', weight: 'normal' | 'bold' = 'normal') {
  return `${weight} ${theme.font[size]}px ${theme.font.family}`;
}

/** Exposes the theme to CSS as custom properties, e.g. --color-accent. */
export function applyTheme(root: HTMLElement = document.documentElement) {
  for (const [name, value] of Object.entries(theme.colors)) {
    root.style.setProperty(`--color-${name}`, value);
  }
  root.style.setProperty('--font-family', theme.font.family);
  root.style.setProperty('--font-text', theme.font.textFamily);
  root.style.setProperty('--radius', `${theme.radius}px`);
}
