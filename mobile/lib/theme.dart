import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // 100% Synchronized Theme Tokens with the "Luminous Learning" Web Design System
  static const Color background = Color(0xFF11131C); // Perfect match with Next.js theme (#11131c)
  static const Color surfaceElevated = Color(0x1FFFFFFF); // 12% Translucent glass layer matching rgba(255,255,255,0.12)
  static const Color surfaceElevatedHigh = Color(0x28FFFFFF); // 16% Translucent active glass layer
  static const Color accentPrimary = Color(0xFF3F51B5); // Royal Indigo (#3f51b5) - Core brand identity
  static const Color accentSecondary = Color(0xFFE91E63); // Soft Rose (#e91e63) - Radiant highlight accent
  static const Color accentError = Color(0xFFF43F5E); // Rose 500 for critical errors and delete actions
  static const Color accentSuccess = Color(0xFF10B981); // Emerald 500 for successful operations and completion
  static const Color textPrimary = Color(0xFFFFFFFF); // Pure white for high contrast typography
  static const Color textSecondary = Color(0xB3FFFFFF); // 70% White opacity matching web text-secondary
  static const Color textMuted = Color(0x80FFFFFF); // 50% White opacity matching web text-muted
  static const Color border = Color(0x1AFFFFFF); // Fine crisp glass border matching web border (10% white)
  static const Color borderAccent = Color(0x3DE91E63); // Soft Rose glowing border accent (24% opacity)

  // Gorgeous gradients that match the Next.js web application
  static const Gradient primaryGradient = LinearGradient(
    colors: [Color(0xFF3F51B5), Color(0xFF6366F1)], // Royal Indigo to Electric Violet
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const Gradient secondaryGradient = LinearGradient(
    colors: [Color(0xFFE91E63), Color(0xFFF43F5E)], // Soft Rose to Deep Crimson
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const Gradient accentGradient = LinearGradient(
    colors: [Color(0xFFEC4899), Color(0xFFE91E63)], // Hot Pink to Soft Rose
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const Gradient successGradient = LinearGradient(
    colors: [Color(0xFF10B981), Color(0xFF059669)], // Vibrant Emerald to Dark Emerald
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const Gradient glassCardGradient = LinearGradient(
    colors: [Color(0x14FFFFFF), Color(0x04FFFFFF)], // Ultra-translucent glass gradient
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static BoxDecoration get glassDecoration {
    return BoxDecoration(
      gradient: glassCardGradient,
      borderRadius: BorderRadius.circular(24),
      border: Border.all(color: border, width: 1.0),
      boxShadow: const [
        BoxShadow(
          color: Color(0x3B000000),
          blurRadius: 24,
          offset: Offset(0, 12),
        ),
      ],
    );
  }

  static BoxDecoration glassDecorationWithAccent(Color accentColor) {
    return BoxDecoration(
      gradient: glassCardGradient,
      borderRadius: BorderRadius.circular(24),
      border: Border.all(color: accentColor.withOpacity(0.25), width: 1.2),
      boxShadow: [
        BoxShadow(
          color: accentColor.withOpacity(0.08),
          blurRadius: 32,
          spreadRadius: 1,
        ),
        const BoxShadow(
          color: Color(0x3B000000),
          blurRadius: 24,
          offset: Offset(0, 12),
        ),
      ],
    );
  }

  static ThemeData get darkTheme {
    return ThemeData(
      brightness: Brightness.dark,
      scaffoldBackgroundColor: background,
      primaryColor: accentPrimary,
      colorScheme: const ColorScheme.dark(
        primary: accentPrimary,
        secondary: accentSecondary,
        surface: Color(0xFF161924), // Indigo-gray tinted slate surface card base
        background: background,
        error: accentError,
        onPrimary: Colors.white,
        onSecondary: Colors.white,
        onSurface: textPrimary,
      ),
      // Synchronized Typography using the clean and modern Manrope font family
      textTheme: GoogleFonts.manropeTextTheme(ThemeData.dark().textTheme).copyWith(
        displayLarge: GoogleFonts.manrope(color: textPrimary, fontWeight: FontWeight.w800, fontSize: 32, letterSpacing: -0.5),
        displayMedium: GoogleFonts.manrope(color: textPrimary, fontWeight: FontWeight.w700, fontSize: 24, letterSpacing: -0.3),
        bodyLarge: GoogleFonts.manrope(color: textPrimary, fontWeight: FontWeight.w500, fontSize: 18),
        bodyMedium: GoogleFonts.manrope(color: textSecondary, fontWeight: FontWeight.w400, fontSize: 16),
        labelLarge: GoogleFonts.manrope(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 18),
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        iconTheme: const IconThemeData(color: textPrimary, size: 28),
        titleTextStyle: GoogleFonts.manrope(color: textPrimary, fontWeight: FontWeight.w700, fontSize: 22),
      ),
      cardTheme: CardThemeData(
        color: const Color(0xFF161924),
        elevation: 0,
        margin: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(24),
          side: const BorderSide(color: border, width: 1.0),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: accentPrimary,
          foregroundColor: Colors.white,
          elevation: 4,
          padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          textStyle: GoogleFonts.manrope(fontWeight: FontWeight.w700, fontSize: 18),
        ),
      ),
      floatingActionButtonTheme: const FloatingActionButtonThemeData(
        backgroundColor: accentPrimary,
        foregroundColor: Colors.white,
        elevation: 6,
        iconSize: 32,
        shape: CircleBorder(),
      ),
      iconTheme: const IconThemeData(
        color: accentSecondary, // Uses Soft Rose as standard interactive icon focal point
        size: 28,
      ),
    );
  }
}
