import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import 'package:alan_voice/alan_voice.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:go_router/go_router.dart';
import 'dart:io' show Platform;
import 'package:firebase_auth/firebase_auth.dart';
import 'firebase_options.dart';
import 'theme.dart';
import 'screens/home_screen.dart';
import 'screens/sign_in_screen.dart';
import 'screens/community_screen.dart';
import 'screens/games_screen.dart';
import 'screens/courses_screen.dart';
import 'screens/pronunciation_screen.dart';
import 'screens/lecture_screen.dart';
import 'screens/story_telling_screen.dart';
import 'screens/quiz_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Firebase: init on web and mobile (skip in tests)
  final bool isTest = !kIsWeb && Platform.environment.containsKey('FLUTTER_TEST');
  if (!isTest) {
    try {
      await Firebase.initializeApp(
        options: DefaultFirebaseOptions.currentPlatform,
      );
    } catch (e) {
      debugPrint('Firebase initialization failed: $e');
    }
  }
  
  runApp(const InsightEdMobileApp());
}

final GoRouter _router = GoRouter(
  initialLocation: '/sign-in',
  redirect: (context, state) {
    try {
      final bool loggedIn = FirebaseAuth.instance.currentUser != null;
      final bool loggingIn = state.matchedLocation == '/sign-in';

      if (!loggedIn && !loggingIn) {
        return '/sign-in';
      }
      if (loggedIn && loggingIn) {
        return '/';
      }
    } catch (_) {}
    return null;
  },
  routes: [
    GoRoute(
      path: '/sign-in',
      builder: (context, state) => const SignInScreen(),
    ),
    GoRoute(
      path: '/',
      builder: (context, state) => const HomeScreen(),
    ),
    GoRoute(
      path: '/courses',
      builder: (context, state) => const CoursesScreen(),
    ),
    GoRoute(
      path: '/pronunciation',
      builder: (context, state) => const PronunciationScreen(),
    ),
    GoRoute(
      path: '/community',
      builder: (context, state) => const CommunityScreen(),
    ),
    GoRoute(
      path: '/games',
      builder: (context, state) => const GamesScreen(),
    ),
    GoRoute(
      path: '/lecture',
      builder: (context, state) {
        final extra = state.extra;
        if (extra is Map && extra.containsKey('lessons')) {
          final lessonsRaw = extra['lessons'] as List;
          final List<Map<String, String>> lessons = lessonsRaw.map((e) {
            final m = e as Map;
            return m.map((k, v) => MapEntry(k.toString(), v.toString()));
          }).toList();
          return LectureScreen(
            courseName: extra['courseName']?.toString() ?? 'Course',
            lessons: lessons,
          );
        }
        final Map<String, String> args = extra is Map
            ? extra.map((key, value) => MapEntry(key.toString(), value?.toString() ?? ''))
            : {};
        return LectureScreen(
          title: args['title'] ?? 'Lecture',
          content: args['content'] ?? 'Coming soon.',
        );
      },
    ),
    GoRoute(
      path: '/story-telling',
      builder: (context, state) => const StoryTellingScreen(),
    ),
    GoRoute(
      path: '/quiz',
      builder: (context, state) => const QuizScreen(),
    ),
  ],
);


class InsightEdMobileApp extends StatefulWidget {
  const InsightEdMobileApp({super.key});

  @override
  State<InsightEdMobileApp> createState() => _InsightEdMobileAppState();
}

class _InsightEdMobileAppState extends State<InsightEdMobileApp> {
  @override
  void initState() {
    super.initState();
    // Alan Voice only works on mobile (Android/iOS), not web, and skip in tests
    final bool isTest = !kIsWeb && Platform.environment.containsKey('FLUTTER_TEST');
    if (!kIsWeb && !isTest) {
      _initAlanVoice();
    }
  }

  Future<void> _initAlanVoice() async {
    try {
      final status = await Permission.microphone.request();
      debugPrint('Microphone permission: $status');
      _setupAlan();
    } catch (e) {
      debugPrint('Permission request failed: $e');
    }
  }

  void _setupAlan() {
    try {
      AlanVoice.addButton(
        "a9aafa94367ae846d5a3ee4d8ef865a52e956eca572e1d8b807a3e2338fdd0dc/stage",
        buttonAlign: AlanVoice.BUTTON_ALIGN_LEFT,
      );
      AlanVoice.onCommand.add((command) => _handleCommand(command.data));
    } catch (e) {
      debugPrint('Alan Voice setup failed: $e');
    }
  }

  void _handleCommand(dynamic commandData) {
    if (commandData is Map<String, dynamic>) {
      final command = commandData["command"] ?? commandData["commands"];
      switch (command) {
        case "open_courses":
        case "Gyan":
        case "Technical":
        case "NTechnical":
          _router.push('/courses');
          break;
        case "open_pronunciation":
        case "guide":
          _router.push('/pronunciation');
          break;
        case "open_community":
        case "talkvoco":
          _router.push('/community');
          break;
        case "open_games":
        case "Games":
          _router.push('/games');
          break;
        case "go_back":
        case "back":
          if (_router.canPop()) {
            _router.pop();
          } else {
            _router.go('/');
          }
          break;
        case "logout":
          _router.go('/sign-in');
          break;
        default:
          debugPrint("Unknown command: $command");
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'InsightEd',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      routerConfig: _router,
    );
  }
}
