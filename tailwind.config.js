const charcoal = '#343434';
const orange = '#FF5124';
const gold = '#FFB42C';
const neutralLight = '#F8F8F8';
const neutralMid = '#EDEDED';
const neutralDark = '#D8D8D8';

const withAlpha = (hex, alpha) => {
  const [r, g, b] = [hex.slice(1, 3), hex.slice(3, 5), hex.slice(5, 7)].map((value) => parseInt(value, 16));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const brandColors = {
  transparent: 'transparent',
  current: 'currentColor',
  white: '#FFFFFF',
  charcoal,
  orange,
  gold,
  neutralLight,
  neutralMid,
  neutralDark,
  slate: {
    50: neutralLight,
    100: neutralLight,
    200: neutralMid,
    300: neutralDark,
    400: withAlpha(charcoal, 0.55),
    500: charcoal,
    600: charcoal,
    700: charcoal,
    800: charcoal,
    900: charcoal
  },
  gray: {
    50: neutralLight,
    100: neutralLight,
    200: neutralMid,
    300: neutralDark,
    400: withAlpha(charcoal, 0.55),
    500: charcoal,
    600: charcoal,
    700: charcoal,
    800: charcoal,
    900: charcoal
  },
  zinc: {
    50: neutralLight,
    100: neutralLight,
    200: neutralMid,
    300: neutralDark,
    400: withAlpha(charcoal, 0.5),
    500: charcoal,
    600: charcoal,
    700: charcoal,
    800: charcoal,
    900: charcoal
  },
  rose: {
    50: withAlpha(orange, 0.12),
    100: withAlpha(orange, 0.16),
    400: withAlpha(orange, 0.55),
    500: orange,
    600: orange
  },
  orange: {
    50: withAlpha(orange, 0.12),
    100: withAlpha(orange, 0.16),
    200: withAlpha(orange, 0.3),
    300: withAlpha(orange, 0.45),
    400: withAlpha(orange, 0.65),
    500: orange,
    600: orange,
    700: orange
  },
  yellow: {
    100: withAlpha(gold, 0.18),
    200: withAlpha(gold, 0.3),
    300: withAlpha(gold, 0.45),
    400: withAlpha(gold, 0.65),
    500: gold,
    600: gold
  }
};

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    colors: brandColors,
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        'brand-soft': '0 14px 28px rgba(52,52,52,0.12)',
        'brand-medium': '0 18px 38px rgba(52,52,52,0.16)',
        'brand-hard': '0 20px 45px rgba(52,52,52,0.2)'
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(120deg, #FF5124 0%, #FFB42C 100%)'
      },
      borderColor: {
        brand: 'rgba(52,52,52,0.1)'
      },
      ringColor: {
        brand: '#FF5124'
      },
      textColor: {
        'charcoal-muted': 'rgba(52,52,52,0.75)',
        'charcoal-subtle': 'rgba(52,52,52,0.55)'
      }
    }
  },
  plugins: []
};