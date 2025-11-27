/**
 * Vendibook Design System
 * Centralized color, spacing, and shadow tokens
 */

export const colors = {
  white: '#FFFFFF',
  textMain: '#343434',
  textMuted: 'rgba(52, 52, 52, 0.65)',
  orange: '#FF5124',
  orangeLight: '#FF5124',
  yellow: '#FFB42C',
  borderSubtle: '#EDEDED',
  bgSoft: '#F8F8F8',
  success: '#FFB42C',
  error: '#FF5124',
  warning: '#FFB42C'
};

export const radii = {
  small: '6px',
  medium: '10px',
  large: '16px'
};

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  xxl: '32px'
};

export const shadows = {
  cardShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  cardHover: '0 8px 24px rgba(0, 0, 0, 0.12)',
  modalShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
};

export const listingTypeChips = {
  RENT: {
    bgColor: 'rgba(255, 180, 44, 0.15)',
    textColor: '#FF5124',
    label: 'RENT'
  },
  SALE: {
    bgColor: 'rgba(255, 180, 44, 0.12)',
    textColor: '#FFB42C',
    label: 'FOR SALE'
  },
  EVENT_PRO: {
    bgColor: 'rgba(255, 180, 44, 0.12)',
    textColor: '#FF5124',
    label: 'EVENT PRO'
  }
};

export const theme = {
  colors,
  radii,
  spacing,
  shadows,
  listingTypeChips
};

export default theme;
