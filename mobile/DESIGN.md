---
name: InsightEd Accessibility & Voice First
colors:
  surface: '#222222'
  surface-dim: '#181818'
  surface-bright: '#333333'
  surface-container-lowest: '#111111'
  surface-container-low: '#1a1a1a'
  surface-container: '#222222'
  surface-container-high: '#2c2c2c'
  surface-container-highest: '#383838'
  on-surface: '#FFFFFF'
  on-surface-variant: '#E0E0E0'
  inverse-surface: '#FFFFFF'
  inverse-on-surface: '#111111'
  outline: '#444444'
  outline-variant: '#555555'
  surface-tint: '#FFC300'
  primary: '#FFC300'
  on-primary: '#000000'
  primary-container: '#FFC300'
  on-primary-container: '#000000'
  inverse-primary: '#00E5FF'
  secondary: '#00E5FF'
  on-secondary: '#000000'
  secondary-container: '#00E5FF'
  on-secondary-container: '#000000'
  tertiary: '#00E676'
  on-tertiary: '#000000'
  tertiary-container: '#00E676'
  on-tertiary-container: '#000000'
  error: '#FF3366'
  on-error: '#FFFFFF'
  error-container: '#FF3366'
  on-error-container: '#FFFFFF'
  background: '#111111'
  on-background: '#FFFFFF'
  surface-variant: '#2C2C2C'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 34px
    fontWeight: '900'
    lineHeight: 42px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '900'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 26px
    fontWeight: '800'
    lineHeight: 34px
  headline-sm:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '800'
    lineHeight: 30px
  body-lg:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 30px
  body-md:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 26px
  body-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 22px
  label-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '800'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '700'
    lineHeight: 18px
  label-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 16px
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1rem
  lg: 1.5rem
  xl: 2rem
  full: 9999px
spacing:
  base: 8px
  container-padding-mobile: 24px
  container-padding-desktop: 48px
  gutter: 20px
  stack-sm: 12px
  stack-md: 20px
  stack-lg: 40px
---

## Brand & Style

This design system is specifically engineered for **visually impacted users** and **voice-prioritized navigation**, drawing inspiration from highly accessible modern e-education applications. 

The brand personality is **direct, supportive, and energetic**, utilizing thick borders, high-contrast flat primary colors, and deep offset shadows. This creates strong physical affordance so the user can easily perceive touch targets.

## Colors

- **Background:** Deep obsidian dark (#111111) to minimize glare and maximize contrast.
- **Primary (Sunshine Yellow):** Vibrant Yellow (#FFC300) for primary triggers and voice controls.
- **Secondary (Electric Cyan):** Vibrant Cyan (#00E5FF) for navigation cues.
- **Success (Lime Green):** Vibrant Green (#00E676) for success states.
- **Error (Neon Pink):** Neon Pink (#FF3366) for errors and alert banners.

## Voice Navigation Cues
All main cards and active modules must feature a highly visible voice mic icon (`LucideIcons.mic`) to clearly denote the hands-free capability. Every screen has a dedicated large microphone floating button that acts as the global command indicator.
