import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../theme.dart';
import 'package:flutter_tts/flutter_tts.dart';
import 'package:record/record.dart';
import 'package:audioplayers/audioplayers.dart';
import 'package:path_provider/path_provider.dart';
import 'package:permission_handler/permission_handler.dart';

class PronunciationScreen extends StatefulWidget {
  const PronunciationScreen({super.key});

  @override
  State<PronunciationScreen> createState() => _PronunciationScreenState();
}

class _PronunciationScreenState extends State<PronunciationScreen> {
  bool isRecording = false;
  bool isPlaying = false;
  String? audioPath;

  final FlutterTts flutterTts = FlutterTts();
  late final AudioRecorder _audioRecorder;
  final AudioPlayer _audioPlayer = AudioPlayer();

  final List<String> phrases = [
    "The quick brown fox jumps over the lazy dog.",
    "A journey of a thousand miles begins with a single step.",
    "To be or not to be, that is the question.",
    "All that glitters is not gold."
  ];
  int currentPhraseIndex = 0;

  @override
  void initState() {
    super.initState();
    _audioRecorder = AudioRecorder();
    _audioPlayer.onPlayerComplete.listen((event) {
      if (mounted) setState(() => isPlaying = false);
    });
  }

  @override
  void dispose() {
    _audioRecorder.dispose();
    _audioPlayer.dispose();
    super.dispose();
  }

  Future<void> _listenToPhrase() async {
    await flutterTts.setLanguage("en-US");
    await flutterTts.speak(phrases[currentPhraseIndex]);
  }

  Future<void> _toggleRecording() async {
    if (isRecording) {
      final path = await _audioRecorder.stop();
      if (mounted) {
        setState(() {
          isRecording = false;
          audioPath = path;
        });
      }
    } else {
      final status = await Permission.microphone.request();
      if (status.isGranted) {
        final dir = await getApplicationDocumentsDirectory();
        final path = '${dir.path}/pronunciation_record.m4a';
        await _audioRecorder.start(const RecordConfig(), path: path);
        if (mounted) setState(() => isRecording = true);
      } else {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Microphone permission required')));
      }
    }
  }

  Future<void> _playRecording() async {
    if (audioPath != null && !isPlaying) {
      setState(() => isPlaying = true);
      await _audioPlayer.play(DeviceFileSource(audioPath!));
    } else if (isPlaying) {
      await _audioPlayer.stop();
      setState(() => isPlaying = false);
    }
  }

  void _nextPhrase() {
    if (currentPhraseIndex < phrases.length - 1) {
      setState(() {
        currentPhraseIndex++;
        audioPath = null;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(LucideIcons.arrowLeft, color: AppTheme.accentPrimary),
          onPressed: () => context.pop(),
        ),
        title: const Text('Pronunciation Coach'),
      ),
      body: SafeArea(
        child: Stack(
          children: [
            // Decorative background glowing blobs
            Positioned(
              top: -40,
              left: -80,
              child: Container(
                width: 250,
                height: 250,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppTheme.accentSecondary.withOpacity(0.08),
                ),
                child: BackdropFilter(
                  filter: ImageFilter.blur(sigmaX: 90, sigmaY: 90),
                  child: Container(color: Colors.transparent),
                ),
              ),
            ),
            Positioned(
              bottom: 80,
              right: -100,
              child: Container(
                width: 280,
                height: 280,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppTheme.accentPrimary.withOpacity(0.06),
                ),
                child: BackdropFilter(
                  filter: ImageFilter.blur(sigmaX: 90, sigmaY: 90),
                  child: Container(color: Colors.transparent),
                ),
              ),
            ),

            Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                children: [
                  Expanded(
                    child: Center(
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 36),
                        decoration: AppTheme.glassDecoration,
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                              decoration: AppTheme.glassDecorationWithAccent(AppTheme.accentSecondary),
                              child: Text(
                                'PHRASE ${currentPhraseIndex + 1} OF ${phrases.length}',
                                style: const TextStyle(
                                  fontFamily: 'Lexend',
                                  color: Colors.white,
                                  fontWeight: FontWeight.w800,
                                  fontSize: 13,
                                  letterSpacing: 0.5,
                                ),
                              ),
                            ),
                            const SizedBox(height: 28),
                            Text(
                              '"${phrases[currentPhraseIndex]}"',
                              textAlign: TextAlign.center,
                              style: const TextStyle(
                                fontFamily: 'Lexend',
                                fontSize: 24,
                                fontWeight: FontWeight.w800,
                                color: Colors.white,
                                height: 1.45,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),

                  const SizedBox(height: 24),

                  // Audio Controls
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      _buildControlBtn(
                        icon: LucideIcons.volume2,
                        label: 'Listen',
                        btnColor: AppTheme.accentPrimary,
                        onTap: _listenToPhrase,
                      ),
                      _buildControlBtn(
                        icon: isRecording ? LucideIcons.square : LucideIcons.mic,
                        label: isRecording ? 'Stop' : 'Record',
                        btnColor: isRecording ? AppTheme.accentError : AppTheme.accentSecondary,
                        onTap: _toggleRecording,
                        isLarge: true,
                      ),
                      _buildControlBtn(
                        icon: isPlaying ? LucideIcons.square : LucideIcons.play,
                        label: isPlaying ? 'Stop' : 'Play',
                        btnColor: audioPath != null ? AppTheme.accentSuccess : Colors.grey.shade800,
                        onTap: audioPath != null ? _playRecording : () {},
                      ),
                    ],
                  ).animate().fade().slideY(begin: 0.08),

                  const SizedBox(height: 40),

                  if (currentPhraseIndex < phrases.length - 1)
                    SizedBox(
                      height: 60,
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: _nextPhrase,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppTheme.accentPrimary,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                          ),
                        ),
                        child: const Text(
                          'Next Phrase',
                          style: TextStyle(
                            fontFamily: 'Lexend',
                            fontWeight: FontWeight.w800,
                            fontSize: 16,
                          ),
                        ),
                      ),
                    ).animate().fade(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildControlBtn({
    required IconData icon,
    required String label,
    required Color btnColor,
    required VoidCallback onTap,
    bool isLarge = false,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
          Container(
            padding: EdgeInsets.all(isLarge ? 22 : 16),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [btnColor, btnColor.withOpacity(0.6)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: btnColor.withOpacity(0.3),
                  blurRadius: 16,
                  offset: const Offset(0, 4),
                )
              ],
            ),
            child: Icon(icon, color: Colors.white, size: isLarge ? 32 : 24),
          ),
          const SizedBox(height: 12),
          Text(
            label,
            style: const TextStyle(
              fontFamily: 'Lexend',
              color: Colors.white70,
              fontSize: 14,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}
