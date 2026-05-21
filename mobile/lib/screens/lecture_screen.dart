import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_tts/flutter_tts.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../theme.dart';

class LectureScreen extends StatefulWidget {
  final String? courseName;
  final List<Map<String, String>>? lessons;
  final String? title; // fallback
  final String? content; // fallback

  const LectureScreen({
    super.key,
    this.courseName,
    this.lessons,
    this.title,
    this.content,
  });

  @override
  State<LectureScreen> createState() => _LectureScreenState();
}

class _LectureScreenState extends State<LectureScreen> {
  final FlutterTts flutterTts = FlutterTts();
  bool _isSpeaking = false;
  int _currentLessonIndex = 0;
  late List<Map<String, String>> _lessonsList;
  late String _courseTitle;

  @override
  void initState() {
    super.initState();
    _initData();
    _initTts();
  }

  void _initData() {
    if (widget.lessons != null && widget.lessons!.isNotEmpty) {
      _lessonsList = widget.lessons!;
      _courseTitle = widget.courseName ?? 'Course';
    } else {
      _lessonsList = [
        {
          'title': widget.title ?? 'Lecture',
          'content': widget.content ?? 'Coming soon.',
        }
      ];
      _courseTitle = widget.title ?? 'Lecture';
    }
  }

  void _initTts() {
    flutterTts.setLanguage("en-US");
    flutterTts.setStartHandler(() {
      if (mounted) setState(() => _isSpeaking = true);
    });
    flutterTts.setCompletionHandler(() {
      if (mounted) setState(() => _isSpeaking = false);
    });
    flutterTts.setErrorHandler((msg) {
      if (mounted) setState(() => _isSpeaking = false);
    });
  }

  void _speak() async {
    final currentContent = _lessonsList[_currentLessonIndex]['content'] ?? '';
    await flutterTts.speak(currentContent);
  }

  void _stop() async {
    await flutterTts.stop();
  }

  void _selectLesson(int index) {
    if (index < 0 || index >= _lessonsList.length) return;
    _stop();
    setState(() {
      _currentLessonIndex = index;
    });
    // Auto-speak new lesson for standard fluid dynamic UX
    Future.delayed(const Duration(milliseconds: 300), () {
      _speak();
    });
  }

  @override
  void dispose() {
    flutterTts.stop();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final activeLesson = _lessonsList[_currentLessonIndex];
    final activeTitle = activeLesson['title'] ?? 'Lecture';
    final activeContent = activeLesson['content'] ?? 'Coming soon.';

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(LucideIcons.arrowLeft, color: AppTheme.accentPrimary),
          onPressed: () => context.pop(),
        ),
        title: Text(_courseTitle),
      ),
      body: SafeArea(
        child: Stack(
          children: [
            // Decorative background glowing blobs
            Positioned(
              top: -80,
              left: -100,
              child: Container(
                width: 300,
                height: 300,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppTheme.accentPrimary.withOpacity(0.08),
                ),
                child: BackdropFilter(
                  filter: ImageFilter.blur(sigmaX: 95, sigmaY: 95),
                  child: Container(color: Colors.transparent),
                ),
              ),
            ),
            Positioned(
              bottom: -60,
              right: -100,
              child: Container(
                width: 280,
                height: 280,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppTheme.accentSecondary.withOpacity(0.07),
                ),
                child: BackdropFilter(
                  filter: ImageFilter.blur(sigmaX: 95, sigmaY: 95),
                  child: Container(color: Colors.transparent),
                ),
              ),
            ),

            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Voice active hint
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    decoration: AppTheme.glassDecorationWithAccent(AppTheme.accentSecondary),
                    child: Row(
                      children: [
                        const Icon(LucideIcons.mic, color: AppTheme.accentSecondary, size: 22),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            'Say "read lesson" or "stop reading" for hands-free support.',
                            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                  fontWeight: FontWeight.w600,
                                  color: AppTheme.textSecondary,
                                ),
                          ),
                        ),
                      ],
                    ),
                  ).animate().fade(),

                  const SizedBox(height: 16),

                  // Reading Board / Card
                  Expanded(
                    flex: 3,
                    child: Container(
                      padding: const EdgeInsets.all(24),
                      decoration: AppTheme.glassDecoration,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Expanded(
                                child: Text(
                                  activeTitle,
                                  style: const TextStyle(
                                    fontFamily: 'Lexend',
                                    color: Colors.white,
                                    fontSize: 20,
                                    fontWeight: FontWeight.w800,
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                decoration: BoxDecoration(
                                  color: AppTheme.accentSecondary.withOpacity(0.15),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Text(
                                  'Lesson ${_currentLessonIndex + 1} of ${_lessonsList.length}',
                                  style: const TextStyle(
                                    fontFamily: 'Lexend',
                                    color: AppTheme.accentSecondary,
                                    fontSize: 12,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          const Divider(color: AppTheme.border, height: 1),
                          const SizedBox(height: 16),
                          Expanded(
                            child: SingleChildScrollView(
                              physics: const BouncingScrollPhysics(),
                              child: Text(
                                activeContent,
                                style: const TextStyle(
                                  fontFamily: 'Lexend',
                                  color: Colors.white,
                                  fontSize: 16,
                                  fontWeight: FontWeight.w500,
                                  height: 1.6,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                  const SizedBox(height: 16),

                  // Syllabus selector (only shown if there are multiple lessons)
                  if (_lessonsList.length > 1)
                    Expanded(
                      flex: 2,
                      child: Container(
                        padding: const EdgeInsets.all(18),
                        decoration: AppTheme.glassDecoration,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            const Row(
                              children: [
                                Icon(LucideIcons.bookOpen, color: AppTheme.accentPrimary, size: 18),
                                SizedBox(width: 8),
                                Text(
                                  'Course Syllabus',
                                  style: TextStyle(
                                    fontFamily: 'Lexend',
                                    color: Colors.white,
                                    fontSize: 15,
                                    fontWeight: FontWeight.w800,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 10),
                            Expanded(
                              child: ListView.builder(
                                physics: const BouncingScrollPhysics(),
                                itemCount: _lessonsList.length,
                                itemBuilder: (context, idx) {
                                  final isCurrent = idx == _currentLessonIndex;
                                  return Padding(
                                    padding: const EdgeInsets.only(bottom: 8.0),
                                    child: GestureDetector(
                                      onTap: () => _selectLesson(idx),
                                      child: AnimatedContainer(
                                        duration: const Duration(milliseconds: 250),
                                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                                        decoration: BoxDecoration(
                                          color: isCurrent
                                              ? AppTheme.accentPrimary.withOpacity(0.12)
                                              : Colors.white.withOpacity(0.02),
                                          borderRadius: BorderRadius.circular(12),
                                          border: Border.all(
                                            color: isCurrent
                                                ? AppTheme.accentPrimary.withOpacity(0.5)
                                                : AppTheme.border,
                                            width: 1.0,
                                          ),
                                        ),
                                        child: Row(
                                          children: [
                                            Container(
                                              width: 24,
                                              height: 24,
                                              decoration: BoxDecoration(
                                                color: isCurrent
                                                    ? AppTheme.accentPrimary
                                                    : Colors.white.withOpacity(0.08),
                                                shape: BoxShape.circle,
                                              ),
                                              alignment: Alignment.center,
                                              child: Text(
                                                '${idx + 1}',
                                                style: TextStyle(
                                                  fontFamily: 'Lexend',
                                                  color: isCurrent ? Colors.white : AppTheme.textSecondary,
                                                  fontSize: 12,
                                                  fontWeight: FontWeight.w700,
                                                ),
                                              ),
                                            ),
                                            const SizedBox(width: 12),
                                            Expanded(
                                              child: Text(
                                                _lessonsList[idx]['title'] ?? 'Lesson',
                                                style: TextStyle(
                                                  fontFamily: 'Lexend',
                                                  color: isCurrent ? Colors.white : AppTheme.textPrimary,
                                                  fontSize: 13,
                                                  fontWeight: isCurrent ? FontWeight.w700 : FontWeight.w500,
                                                ),
                                                maxLines: 1,
                                                overflow: TextOverflow.ellipsis,
                                              ),
                                            ),
                                            if (isCurrent)
                                              const Icon(
                                                LucideIcons.volume2,
                                                color: AppTheme.accentPrimary,
                                                size: 16,
                                              )
                                            else
                                              Icon(
                                                LucideIcons.play,
                                                color: Colors.white.withOpacity(0.4),
                                                size: 14,
                                              ),
                                          ],
                                        ),
                                      ),
                                    ),
                                  );
                                },
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),

                  const SizedBox(height: 16),

                  // Player Controller Row
                  Row(
                    children: [
                      // Prev Button
                      IconButton(
                        icon: const Icon(LucideIcons.skipBack, color: Colors.white, size: 24),
                        onPressed: _currentLessonIndex > 0
                            ? () => _selectLesson(_currentLessonIndex - 1)
                            : null,
                        color: Colors.white,
                        disabledColor: Colors.white.withOpacity(0.2),
                      ),
                      const SizedBox(width: 8),

                      // Main Speak Button
                      Expanded(
                        child: SizedBox(
                          height: 56,
                          child: ElevatedButton.icon(
                            onPressed: _isSpeaking ? _stop : _speak,
                            icon: Icon(
                              _isSpeaking ? LucideIcons.square : LucideIcons.playCircle,
                              size: 22,
                              color: Colors.white,
                            ),
                            label: Text(
                              _isSpeaking ? "Stop Reading" : "Read Lesson Aloud",
                              style: const TextStyle(
                                fontFamily: 'Lexend',
                                fontWeight: FontWeight.w800,
                                fontSize: 16,
                              ),
                            ),
                            style: ElevatedButton.styleFrom(
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(16),
                              ),
                            ).copyWith(
                              backgroundColor: MaterialStateProperty.all(
                                _isSpeaking ? AppTheme.accentError : AppTheme.accentSecondary,
                              ),
                              foregroundColor: MaterialStateProperty.all(Colors.white),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),

                      // Next Button
                      IconButton(
                        icon: const Icon(LucideIcons.skipForward, color: Colors.white, size: 24),
                        onPressed: _currentLessonIndex < _lessonsList.length - 1
                            ? () => _selectLesson(_currentLessonIndex + 1)
                            : null,
                        color: Colors.white,
                        disabledColor: Colors.white.withOpacity(0.2),
                      ),
                    ],
                  ).animate().scale(delay: 100.ms).fade(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
