/**
 * Typography Scale & Styles for KisanQueue Mobile
 */

export const Typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },

  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    hero: 30,
    display: 36,
  },

  lineHeight: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 26,
    xl: 28,
    xxl: 32,
    hero: 38,
    display: 44,
  },

  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    heavy: '800' as const,
  },
};

export default Typography;
