/**
 * Vendibook Design System
 * Centralized color, spacing, and shadow tokens
 */

export const colors = {
  white: '#FFFFFF',
  textMain: '#343434',
  textMuted: '#717171',
  orange: '#FF5124',
  orangeLight: '#FF6B35',
  yellow: '#FFB42C',
  borderSubtle: '#EBEBEB',
  bgSoft: '#FAFAFA',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B'
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
    bgColor: '#FFF3E0',
    textColor: '#FF5124',
    label: 'RENT'
  },
  SALE: {
    bgColor: '#E8F5E9',
    textColor: '#10B981',
    label: 'FOR SALE'
  },
  EVENT_PRO: {
    bgColor: '#F3E5F5',
    textColor: '#9C27B0',
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
