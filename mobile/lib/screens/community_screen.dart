import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../theme.dart';

class CommunityScreen extends StatelessWidget {
  const CommunityScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(LucideIcons.arrowLeft, color: AppTheme.accentPrimary),
          onPressed: () => context.pop(),
        ),
        title: const Text('Community Connect'),
      ),
      body: SafeArea(
        child: Stack(
          children: [
            // Decorative background glowing blobs
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
              bottom: 40,
              left: -120,
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
                            'Say "join dev room" or "talk to Mitra" for voice assistance.',
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

                  Text(
                    'AI Companions',
                    style: Theme.of(context).textTheme.displayMedium?.copyWith(
                          color: AppTheme.accentPrimary,
                          fontSize: 24,
                          fontWeight: FontWeight.w800,
                        ),
                  ),
                  const SizedBox(height: 16),

                  _buildBotCard(
                    context,
                    title: 'InsightEd Professional',
                    description: 'AI-driven mock interviews, resume critiques, and vocational career coaching.',
                    icon: LucideIcons.bot,
                    cardColor: AppTheme.accentSecondary, // Cyan Accent
                    delay: 100,
                  ),
                  const SizedBox(height: 20),

                  _buildBotCard(
                    context,
                    title: 'InsightEd Mitra',
                    description: 'Your friendly learning buddy for daily conversation practice and general studies.',
                    icon: LucideIcons.messageCircle,
                    cardColor: AppTheme.accentPrimary, // Indigo Accent
                    delay: 200,
                  ),

                  const SizedBox(height: 36),

                  Text(
                    'Active Peer Rooms',
                    style: Theme.of(context).textTheme.displayMedium?.copyWith(
                          color: AppTheme.accentPrimary,
                          fontSize: 24,
                          fontWeight: FontWeight.w800,
                        ),
                  ),
                  const SizedBox(height: 16),

                  _buildRoomList(context),
                  const SizedBox(height: 40),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBotCard(
    BuildContext context, {
    required String title,
    required String description,
    required IconData icon,
    required Color cardColor,
    required int delay,
  }) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: AppTheme.glassDecorationWithAccent(cardColor),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
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
                      color: cardColor.withOpacity(0.2),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    )
                  ],
                ),
                child: Icon(icon, color: Colors.white, size: 28),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Text(
                  title,
                  style: const TextStyle(
                    fontFamily: 'Lexend',
                    fontSize: 20,
                    fontWeight: FontWeight.w800,
                    color: Colors.white,
                    letterSpacing: -0.5,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            description,
            style: const TextStyle(
              fontFamily: 'Lexend',
              fontSize: 15,
              fontWeight: FontWeight.w500,
              color: AppTheme.textSecondary,
              height: 1.45,
            ),
          ),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
            ).copyWith(
              backgroundColor: MaterialStateProperty.all(cardColor),
              foregroundColor: MaterialStateProperty.all(Colors.white),
            ),
            icon: const Icon(LucideIcons.phoneCall, color: Colors.white, size: 20),
            label: const Text('Start Chat'),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  backgroundColor: AppTheme.background.withOpacity(0.9),
                  content: Text(
                    'Connecting to $title...',
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w600,
                      fontSize: 15,
                    ),
                  ),
                  behavior: SnackBarBehavior.floating,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                    side: const BorderSide(color: AppTheme.border, width: 1),
                  ),
                ),
              );
            },
          ),
        ],
      ),
    ).animate().fade(delay: delay.ms).slideY(begin: 0.08);
  }

  Widget _buildRoomList(BuildContext context) {
    final rooms = [
      {'name': 'InsightEd Devs Connect', 'participants': '12/20', 'topic': 'Mobile Apps'},
      {'name': 'Interview Prep Room', 'participants': '5/10', 'topic': 'Career Coach'},
      {'name': 'Spoken English Group', 'participants': '8/15', 'topic': 'Languages'},
    ];

    return Column(
      children: rooms.map((room) {
        return Padding(
          padding: const EdgeInsets.only(bottom: 16),
          child: _buildRoomItem(context, room),
        );
      }).toList(),
    );
  }

  Widget _buildRoomItem(BuildContext context, Map<String, String> room) {
    return GestureDetector(
      onTap: () {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: AppTheme.background.withOpacity(0.9),
            content: Text(
              'Joining room: ${room['name']}...',
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.w600,
                fontSize: 15,
              ),
            ),
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
              side: const BorderSide(color: AppTheme.border, width: 1),
            ),
          ),
        );
      },
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: AppTheme.glassDecoration,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    room['name']!,
                    style: const TextStyle(
                      fontFamily: 'Lexend',
                      fontSize: 17,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '${room['topic']} • ${room['participants']} listening',
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
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppTheme.accentSecondary.withOpacity(0.15),
                shape: BoxShape.circle,
              ),
              child: const Icon(LucideIcons.users, color: AppTheme.accentSecondary, size: 22),
            ),
          ],
        ),
      ),
    ).animate().fade().slideY(begin: 0.08);
  }
}
