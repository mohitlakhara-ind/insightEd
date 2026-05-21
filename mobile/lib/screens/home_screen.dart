import 'dart:ui';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../theme.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  String _userName = 'Learner';

  @override
  void initState() {
    super.initState();
    if (!kIsWeb) {
      try {
        final user = FirebaseAuth.instance.currentUser;
        if (user != null) {
          _userName = user.displayName ?? user.email?.split('@').first ?? 'Learner';
        }
      } catch (_) {
        // Firebase may not be initialized
      }
    }
  }

  Future<void> _logout() async {
    if (!kIsWeb) {
      try {
        await FirebaseAuth.instance.signOut();
      } catch (_) {}
    }
    if (mounted) context.go('/sign-in');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('InsightEd'),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.logOut, color: AppTheme.accentPrimary),
            onPressed: _logout,
            tooltip: 'Log Out',
          )
        ],
      ),
      body: SafeArea(
        child: Stack(
          children: [
            // Ambient glowing background blobs
            Positioned(
              top: -60,
              right: -100,
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
              left: -120,
              child: Container(
                width: 300,
                height: 300,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppTheme.accentSecondary.withOpacity(0.06),
                ),
                child: BackdropFilter(
                  filter: ImageFilter.blur(sigmaX: 100, sigmaY: 100),
                  child: Container(color: Colors.transparent),
                ),
              ),
            ),

            SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text(
                    'Welcome back,',
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                          color: AppTheme.textSecondary,
                          fontWeight: FontWeight.w600,
                        ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    _userName,
                    style: Theme.of(context).textTheme.displayLarge?.copyWith(
                          color: AppTheme.accentPrimary,
                          fontWeight: FontWeight.w800,
                        ),
                  ).animate().fade().slideY(begin: -0.15, curve: Curves.easeOut),
                  
                  const SizedBox(height: 28),
                  
                  // Premium Glassmorphic Voice active hint banner
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: AppTheme.glassDecorationWithAccent(AppTheme.accentSecondary),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: AppTheme.accentSecondary.withOpacity(0.15),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(LucideIcons.mic, color: AppTheme.accentSecondary, size: 28),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'Voice Assistant Active',
                                style: TextStyle(
                                  fontFamily: 'Lexend',
                                  fontSize: 16,
                                  fontWeight: FontWeight.w800,
                                  color: Colors.white,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                'Tap the floating mic to navigate hands-free.',
                                style: TextStyle(
                                  fontFamily: 'Lexend',
                                  fontSize: 13,
                                  fontWeight: FontWeight.w500,
                                  color: AppTheme.textSecondary,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ).animate().fade(delay: 100.ms),
                  
                  const SizedBox(height: 36),
                  
                  _buildFeatureCard(
                    context,
                    title: 'Pronunciation Coach',
                    description: 'Record & refine your spoken vocabulary.',
                    icon: LucideIcons.mic2,
                    color: AppTheme.accentSecondary, // Cyan
                    route: '/pronunciation',
                    delay: 200,
                  ),
                  const SizedBox(height: 20),
                  
                  _buildFeatureCard(
                    context,
                    title: 'Community Rooms',
                    description: 'Connect with peers and AI mentors.',
                    icon: LucideIcons.users,
                    color: AppTheme.accentPrimary, // Indigo
                    route: '/community',
                    delay: 300,
                  ),
                  const SizedBox(height: 20),
                  
                  _buildFeatureCard(
                    context,
                    title: 'Vocational Courses',
                    description: 'Interactive structural lecture modules.',
                    icon: LucideIcons.bookOpen,
                    color: AppTheme.accentSuccess, // Green
                    route: '/courses',
                    delay: 400,
                  ),
                  const SizedBox(height: 20),
                  
                  _buildFeatureCard(
                    context,
                    title: 'Interactive Mind Games',
                    description: 'Dynamic audio scenarios & memory quizzes.',
                    icon: LucideIcons.gamepad2,
                    color: AppTheme.accentError, // Rose
                    route: '/games',
                    delay: 500,
                  ),
                  
                  const SizedBox(height: 80), // Extra space for FAB
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFeatureCard(BuildContext context, {
    required String title,
    required String description,
    required IconData icon,
    required Color color,
    required String route,
    required int delay,
  }) {
    return GestureDetector(
      onTap: () => context.push(route),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 22),
        decoration: AppTheme.glassDecorationWithAccent(color),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [color, color.withOpacity(0.5)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: color.withOpacity(0.2),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  )
                ],
              ),
              child: const Icon(LucideIcons.mic, color: Colors.white, size: 26), // Standardized voice indicator mic icon as per branding
            ),
            const SizedBox(width: 20),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(icon, color: color, size: 20),
                      const SizedBox(width: 8),
                      Text(
                        title,
                        style: const TextStyle(
                          fontFamily: 'Lexend',
                          fontSize: 18,
                          fontWeight: FontWeight.w800,
                          color: Colors.white,
                          letterSpacing: -0.3,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    description,
                    style: const TextStyle(
                      fontFamily: 'Lexend',
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                      color: AppTheme.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),
            Icon(LucideIcons.chevronRight, color: color.withOpacity(0.6), size: 20),
          ],
        ),
      ),
    ).animate().fade(delay: delay.ms, duration: 400.ms).slideY(begin: 0.08, curve: Curves.easeOut);
  }
}
