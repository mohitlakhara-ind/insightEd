import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
} from '@react-navigation/native';

export const insightLightNavigation = {
  ...NavigationDefaultTheme,
  colors: {
    ...NavigationDefaultTheme.colors,
    primary: '#3F51B5', // Royal Indigo brand anchor
    background: '#FDFCFF', // Bright background
    card: '#FFFFFF',
    text: '#11131C', // Deep dark text
    border: '#E2E8F0',
    notification: '#E91E63', // Soft Rose alert notifications
  },
};

export const insightDarkNavigation = {
  ...NavigationDarkTheme,
  colors: {
    ...NavigationDarkTheme.colors,
    primary: '#3F51B5', // Royal Indigo brand anchor
    background: '#020617', // Harmonized deep space navy background
    card: '#161924', // Card tinted elevated surface
    text: '#FFFFFF', // High-legibility text
    border: 'rgba(255, 255, 255, 0.1)', // Translucent border
    notification: '#E91E63', // Soft Rose alert notifications
  },
};
