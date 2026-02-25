export const colors = {
  primary: {
    50: '#E8F4F4',
    100: '#D1E9E9',
    200: '#A3D3D2',
    300: '#75BDBB',
    400: '#47A7A4',
    500: '#19918E',
    600: '#147A78',
    700: '#0F6462',
    800: '#094E4C',
    900: '#043836',
  },
  accent: {
    50: '#FEF7E8',
    100: '#FDEFD1',
    200: '#FBDFA3',
    300: '#F9CF75',
    400: '#F7B84E',
    500: '#E8960F',
    600: '#BA780C',
    700: '#8B5A09',
    800: '#5D3C06',
    900: '#2E1E03',
  },
  neutral: {
    50: '#F7F9F9',
    100: '#EFF2F2',
    200: '#DFE5E5',
    300: '#CFD8D8',
    400: '#9AACAC',
    500: '#647575',
    600: '#4F5E5E',
    700: '#3A4747',
    800: '#253030',
    900: '#141E1E',
  },
  success: '#15803D',
  error: '#DC2626',
  warning: '#D97706',
  info: '#0284C7',
  white: '#FFFFFF',
  black: '#000000',
} as const;

export const gradients = {
  brand: ['#147A78', '#094E4C'] as const,
  matchGlow: ['#1A8F8C', '#E8960F'] as const,
} as const;

export function getMatchScoreColors(score: number) {
  if (score >= 90) return { bg: colors.accent[400], text: colors.neutral[900] };
  if (score >= 75) return { bg: colors.primary[600], text: colors.white };
  if (score >= 60) return { bg: colors.primary[200], text: colors.primary[800] };
  return { bg: colors.neutral[200], text: colors.neutral[600] };
}
