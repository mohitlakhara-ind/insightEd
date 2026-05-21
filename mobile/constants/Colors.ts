const light = {
  text: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#64748B',
  background: '#FDFCFF',
  surface: '#FFFFFF',
  tint: '#6366F1',
  tabIconDefault: '#94A3B8',
  tabIconSelected: '#6366F1',
  border: '#E2E8F0',
  accent: '#6366F1',
  accentFg: '#FFFFFF',
  accentMuted: '#EEF2FF',
};

const dark = {
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  background: '#020617',
  surface: '#0F172A',
  tint: '#818CF8',
  tabIconDefault: '#64748B',
  tabIconSelected: '#818CF8',
  border: '#1E293B',
  accent: '#818CF8',
  accentFg: '#FFFFFF',
  accentMuted: '#1E1B4B',
};

export type ColorSchemeColors = typeof light;

export default {
  light,
  dark,
};
