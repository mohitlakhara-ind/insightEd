import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../theme.dart';

class GamesScreen extends StatelessWidget {
  const GamesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(LucideIcons.arrowLeft, color: AppTheme.accentPrimary),
          onPressed: () => context.pop(),
        ),
        title: const Text('Mind Games'),
      ),
      body: SafeArea(
        child: Stack(
          children: [
            // Decorative background glowing blobs
            Positioned(
              top: -60,
              left: -100,
              child: Container(
                width: 250,
                height: 250,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppTheme.accentPrimary.withOpacity(0.08),
                ),
                child: BackdropFilter(
                  filter: ImageFilter.blur(sigmaX: 90, sigmaY: 90),
                  child: Container(color: Colors.transparent),
                ),
              ),
            ),
            Positioned(
              bottom: 80,
              right: -120,
              child: Container(
                width: 280,
                height: 280,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppTheme.accentSecondary.withOpacity(0.06),
                ),
                child: BackdropFilter(
                  filter: ImageFilter.blur(sigmaX: 90, sigmaY: 90),
                  child: Container(color: Colors.transparent),
                ),
              ),
            ),

            SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Voice Indicator banner
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                    decoration: AppTheme.glassDecorationWithAccent(AppTheme.accentSecondary),
                    child: Row(
                      children: [
                        const Icon(LucideIcons.mic, color: AppTheme.accentSecondary, size: 24),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            'Say "start storytelling" or "start quiz" to speak navigation.',
                            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                  fontWeight: FontWeight.w600,
                                  color: AppTheme.textPrimary,
                                ),
                          ),
                        ),
                      ],
                    ),
                  ).animate().fade(),

                  const SizedBox(height: 32),

                  _buildGameCard(
                    context,
                    title: 'Story Telling',
                    description: 'Read descriptive tales and complete interactive voice quizzes to master English.',
                    icon: LucideIcons.bookOpen,
                    cardColor: AppTheme.accentPrimary, // Sunshine Yellow Accent
                    delay: 100,
                    onTap: () => context.push('/story-telling'),
                  ),
                  const SizedBox(height: 20),

                  _buildGameCard(
                    context,
                    title: 'DSA Quiz Arena',
                    description: 'Test your Linked Lists, Arrays, and core computing basics in a gamified arena.',
                    icon: LucideIcons.brainCircuit,
                    cardColor: AppTheme.accentSecondary, // Electric Cyan Accent
                    delay: 200,
                    onTap: () => context.push('/quiz'),
                  ),
                  const SizedBox(height: 20),

                  _buildGameCard(
                    context,
                    title: 'Audio Memory Match',
                    description: 'Listen carefully to vocational sounds and identify correct tools to win points.',
                    icon: LucideIcons.puzzle,
                    cardColor: AppTheme.accentSuccess, // Vibrant Green Accent
                    delay: 300,
                    onTap: () => _showComingSoon(context),
                  ),
                  const SizedBox(height: 20),

                  _buildGameCard(
                    context,
                    title: 'Speed Typing Sprint',
                    description: 'Fast-paced, accessible exercises designed to boost keyboard layout familiarity.',
                    icon: LucideIcons.keyboard,
                    cardColor: AppTheme.accentError, // Neon Pink/Red Accent
                    delay: 400,
                    onTap: () => _showComingSoon(context),
                  ),
                  const SizedBox(height: 40),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showComingSoon(BuildContext context) {
    ScaffoldMessenger.of(context).clearSnackBars();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: const Row(
          children: [
            Icon(LucideIcons.clock, color: Colors.white, size: 20),
            SizedBox(width: 12),
            Text(
              'Coming Soon! Stay tuned!',
              style: TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.w600,
                fontSize: 15,
              ),
            ),
          ],
        ),
        backgroundColor: AppTheme.background.withOpacity(0.9),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: AppTheme.border, width: 1),
        ),
      ),
    );
  }

  Widget _buildGameCard(
    BuildContext context, {
    required String title,
    required String description,
    required IconData icon,
    required Color cardColor,
    required int delay,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
        decoration: AppTheme.glassDecorationWithAccent(cardColor),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [cardColor, cardColor.withOpacity(0.5)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: cardColor.withOpacity(0.25),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  )
                ],
              ),
              child: Icon(icon, color: Colors.white, size: 24),
            ),
            const SizedBox(width: 20),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontFamily: 'Lexend',
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                      color: Colors.white,
                      letterSpacing: -0.5,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    description,
                    style: TextStyle(
                      fontFamily: 'Lexend',
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                      color: AppTheme.textSecondary.withOpacity(0.9),
                      height: 1.45,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    ).animate().fade(delay: delay.ms).slideY(begin: 0.08);
  }
}
