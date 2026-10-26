import { theme } from '../carnival';

const { colors } = theme;

/**
 * The midway map's night-time palette: a horror carnival of crimson and black
 * tents, bone-white trim, grape and soda-green lights, and soda everywhere.
 * Tent reds and the gold of the lights come from the carnival theme; the sky,
 * ground, face paint, soda and other scenery shades only the map uses live here.
 */
export const palette = {
  sky: '#3d1f5c',
  skyHigh: '#120822',
  cloud: '#2a1840',
  cloudShade: '#1d1030',
  haze: '#4a2a63',
  moon: '#efe6cf',
  moonShade: '#cfc3a4',

  grass: '#1f2a24',
  grassDark: '#141c18',
  grassEdge: '#101512',
  grassLight: '#26332c',
  path: '#3a3640',
  pathShade: '#2c2931',
  hedge: '#1b2a20',
  hedgeDark: '#111b15',
  hedgeLight: '#26392b',
  shadow: 'rgba(5, 0, 12, 0.45)',

  red: colors.stripeA,
  redShade: '#a3202f',
  cream: '#ece4d0',
  creamShade: '#c9bfa6',
  black: '#17121c',
  blackShade: '#0b080e',
  gold: colors.accent,
  goldShade: '#c98f12',
  grape: '#7b2fbf',
  grapeShade: '#561f88',
  soda: '#39e07a',
  sodaShade: '#20a957',
  wood: '#4a3328',
  woodDark: '#2a1c16',
  woodLight: '#6b4c3b',
  board: '#2a1c16',
  metal: '#9c95a8',
  metalShade: '#6e6779',
  ink: colors.background,
  opening: '#0d0811',
  closed: '#4b4458',
  closedShade: '#363042',
  white: '#ffffff',

  /** Clown face paint, always this black on this white. */
  paint: '#f6f2ea',
  paintInk: '#0b080e',
  /** Soda flavours, for bottles, cans and spray. */
  sodas: ['#e63946', '#ff8a1f', '#7b2fbf', '#39e07a', '#8b4a2b', '#2fa6e6'],
  /** A clear plastic shine on a bottle. */
  shine: 'rgba(255, 255, 255, 0.55)',
  crate: '#c4252f',
  crateShade: '#8e1822',

  skins: ['#f1c27d', '#c68642', '#8d5524', '#e0ac69', '#ffdbac', '#5c3a21'],
  hairs: ['#120c10', '#1b1035', '#3b2219', '#120c10', '#6b1f2a'],
  shirts: ['#17121c', '#24182f', '#17121c', '#2b2230', '#1c1424', '#3a1420'],
  accents: ['#e63946', '#39e07a', '#7b2fbf', '#ff8a1f', '#ece4d0'],
  pants: ['#141016', '#1f1a26', '#2a2430'],
  bunting: [colors.stripeA, '#17121c', '#ece4d0', '#7b2fbf', '#39e07a', '#17121c'],
  balloons: [colors.stripeA, '#7b2fbf', '#39e07a', '#ff8a1f', '#ece4d0'],
} as const;
