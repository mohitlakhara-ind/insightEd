import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../theme.dart';

class Question {
  final String text;
  final bool answer;
  Question(this.text, this.answer);
}

class QuizScreen extends StatefulWidget {
  const QuizScreen({super.key});

  @override
  State<QuizScreen> createState() => _QuizScreenState();
}

class _QuizScreenState extends State<QuizScreen> {
  int score = 0;
  int currentIndex = 0;
  bool? lastAnswerCorrect;

  final List<Question> questions = [
    Question("InsightEd is designed to help visually impaired users.", true),
    Question("InsightEd is designed for hearing impaired users.", false),
    Question("InsightEd is built with Flutter.", true),
    Question("InsightEd helps people learn new languages and technologies.", true),
    Question("A linked list stores elements in contiguous memory.", false),
    Question("Flutter uses Dart as its programming language.", true),
    Question("State management is not needed in Flutter apps.", false),
    Question("Firebase provides authentication services.", true),
  ];

  void _checkAnswer(bool userChoice) {
    final correct = userChoice == questions[currentIndex].answer;

    setState(() {
      lastAnswerCorrect = correct;
      if (correct) score++;
    });

    ScaffoldMessenger.of(context).clearSnackBars();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            Icon(
              correct ? LucideIcons.checkCircle : LucideIcons.xCircle,
              color: Colors.white,
              size: 24,
            ),
            const SizedBox(width: 12),
            Text(
              correct ? 'Correct! 🎉' : 'Wrong! ❌',
              style: const TextStyle(
                fontWeight: FontWeight.w600,
                color: Colors.white,
                fontFamily: 'Lexend',
                fontSize: 16,
              ),
            ),
          ],
        ),
        backgroundColor: correct ? AppTheme.accentSuccess : AppTheme.accentError,
        duration: const Duration(milliseconds: 900),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: AppTheme.border, width: 1),
        ),
      ),
    );

    Future.delayed(const Duration(milliseconds: 1000), () {
      if (!mounted) return;
      if (currentIndex < questions.length - 1) {
        setState(() {
          currentIndex++;
          lastAnswerCorrect = null;
        });
      } else {
        _showResults();
      }
    });
  }

  void _reset() {
    setState(() {
      currentIndex = 0;
      score = 0;
      lastAnswerCorrect = null;
    });
  }

  void _showResults() {
    final passed = score >= questions.length / 2;
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
        child: AlertDialog(
          backgroundColor: AppTheme.surfaceElevated.withOpacity(0.85),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(28),
            side: const BorderSide(color: AppTheme.border, width: 1),
          ),
          title: Text(
            passed ? 'QUIZ COMPLETED!' : 'TRY AGAIN!',
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontWeight: FontWeight.w800,
              color: Colors.white,
              fontFamily: 'Lexend',
              fontSize: 22,
              letterSpacing: -0.5,
            ),
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: passed
                        ? [AppTheme.accentPrimary, AppTheme.accentPrimary.withOpacity(0.6)]
                        : [AppTheme.accentError, AppTheme.accentError.withOpacity(0.6)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: (passed ? AppTheme.accentPrimary : AppTheme.accentError).withOpacity(0.3),
                      blurRadius: 20,
                      spreadRadius: 2,
                    )
                  ],
                ),
                child: Icon(
                  passed ? LucideIcons.trophy : LucideIcons.refreshCw,
                  color: Colors.white,
                  size: 48,
                ),
              ),
              const SizedBox(height: 24),
              Text(
                'SCORE: $score / ${questions.length}',
                style: const TextStyle(
                  fontSize: 26,
                  fontWeight: FontWeight.w800,
                  color: Colors.white,
                  fontFamily: 'Lexend',
                ),
              ),
              const SizedBox(height: 12),
              Text(
                passed
                    ? 'Fantastic job! You passed!'
                    : 'Practice makes perfect. Try again!',
                textAlign: TextAlign.center,
                style: const TextStyle(
                  color: AppTheme.textSecondary,
                  fontFamily: 'Lexend',
                  fontSize: 15,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
          actionsAlignment: MainAxisAlignment.spaceEvenly,
          actions: [
            ElevatedButton(
              onPressed: () {
                Navigator.of(ctx).pop();
                _reset();
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.accentSecondary,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
              ),
              child: const Text(
                'RETRY',
                style: TextStyle(fontFamily: 'Lexend', fontWeight: FontWeight.w800),
              ),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.of(ctx).pop();
                context.go('/');
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.accentPrimary,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
              ),
              child: const Text(
                'HOME',
                style: TextStyle(fontFamily: 'Lexend', fontWeight: FontWeight.w800),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final question = questions[currentIndex];
    final progress = (currentIndex + 1) / questions.length;

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(LucideIcons.arrowLeft, color: AppTheme.accentPrimary),
          onPressed: () => context.pop(),
        ),
        title: const Text('Quiz Arena'),
        actions: [
          TextButton(
            onPressed: _reset,
            child: const Text(
              'RESET',
              style: TextStyle(
                color: AppTheme.accentError,
                fontWeight: FontWeight.w800,
                fontFamily: 'Lexend',
                fontSize: 14,
              ),
            ),
          ),
        ],
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
              bottom: 80,
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

            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
              child: Column(
                children: [
                  // Score & Progress Indicators
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        decoration: AppTheme.glassDecoration,
                        child: Text(
                          'SCORE: $score / ${questions.length}',
                          style: const TextStyle(
                            fontWeight: FontWeight.w700,
                            color: Colors.white,
                            fontFamily: 'Lexend',
                            fontSize: 14,
                          ),
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        decoration: AppTheme.glassDecoration,
                        child: Text(
                          'Q: ${currentIndex + 1} OF ${questions.length}',
                          style: const TextStyle(
                            fontWeight: FontWeight.w700,
                            color: AppTheme.accentSecondary,
                            fontFamily: 'Lexend',
                            fontSize: 14,
                          ),
                        ),
                      ),
                    ],
                  ).animate().fade(),

                  const SizedBox(height: 20),

                  // Progress bar with elegant border
                  Container(
                    height: 14,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppTheme.border, width: 1),
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(10),
                      child: LinearProgressIndicator(
                        value: progress,
                        backgroundColor: Colors.white.withOpacity(0.05),
                        color: AppTheme.accentPrimary,
                      ),
                    ),
                  ),

                  const SizedBox(height: 36),

                  // Main Question Card
                  Expanded(
                    child: Center(
                      child: Container(
                        padding: const EdgeInsets.all(32),
                        decoration: AppTheme.glassDecoration,
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: AppTheme.accentSecondary.withOpacity(0.15),
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(
                                LucideIcons.helpCircle,
                                color: AppTheme.accentSecondary,
                                size: 36,
                              ),
                            ),
                            const SizedBox(height: 24),
                            Text(
                              question.text,
                              textAlign: TextAlign.center,
                              style: const TextStyle(
                                fontFamily: 'Lexend',
                                fontSize: 22,
                                fontWeight: FontWeight.w800,
                                color: Colors.white,
                                height: 1.45,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ).animate().fade().scale(delay: 100.ms),

                  const SizedBox(height: 36),

                  // True & False options with high visibility & big touch target
                  Row(
                    children: [
                      Expanded(
                        child: SizedBox(
                          height: 60,
                          child: ElevatedButton.icon(
                            onPressed: () => _checkAnswer(true),
                            icon: const Icon(
                              LucideIcons.checkCircle,
                              size: 20,
                              color: Colors.white,
                            ),
                            label: const Text(
                              'TRUE',
                              style: TextStyle(
                                fontFamily: 'Lexend',
                                fontWeight: FontWeight.w800,
                                fontSize: 16,
                              ),
                            ),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppTheme.accentSuccess,
                              foregroundColor: Colors.white,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(16),
                              ),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: SizedBox(
                          height: 60,
                          child: ElevatedButton.icon(
                            onPressed: () => _checkAnswer(false),
                            icon: const Icon(
                              LucideIcons.xCircle,
                              size: 20,
                              color: Colors.white,
                            ),
                            label: const Text(
                              'FALSE',
                              style: TextStyle(
                                fontFamily: 'Lexend',
                                fontWeight: FontWeight.w800,
                                fontSize: 16,
                              ),
                            ),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppTheme.accentError,
                              foregroundColor: Colors.white,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(16),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ).animate().fade().slideY(begin: 0.08),
                  const SizedBox(height: 16),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
