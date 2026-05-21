import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../theme.dart';

class CoursesScreen extends StatelessWidget {
  const CoursesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(LucideIcons.arrowLeft, color: AppTheme.accentPrimary),
          onPressed: () => context.pop(),
        ),
        title: const Text('InsightEd Academy'),
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

            SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Voice Indicator Guide
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                    decoration: AppTheme.glassDecorationWithAccent(AppTheme.accentSecondary),
                    child: Row(
                      children: [
                        const Icon(LucideIcons.mic, color: AppTheme.accentSecondary, size: 24),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            'Say "start Flutter course" to voice open any module.',
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

                  _buildTrackCard(
                    context,
                    title: 'Technical Tracks',
                    description: 'Master Programming, App Building, & Data Structures.',
                    icon: LucideIcons.cpu,
                    accentColor: AppTheme.accentSecondary, // Cyan Accent
                    delay: 100,
                    courses: [
                      {
                        'name': 'Introduction to Flutter',
                        'details': '12 Lessons • 4h 30m',
                        'lessons': [
                          {
                            'title': 'Lesson 1: What is Flutter?',
                            'content': 'Welcome to Introduction to Flutter. Flutter is Google\'s portable UI toolkit for building beautiful, natively compiled applications for mobile, web, desktop, and embedded devices from a single codebase. It uses the Dart programming language and compiles to fast machine code.'
                          },
                          {
                            'title': 'Lesson 2: The Widget Tree & UI Composition',
                            'content': 'In Flutter, everything is a widget. The entire user interface is composed as a tree of widgets. A widget defines a structural element like a button or menu, a stylistic element like a font or color scheme, or an aspect of layout like padding.'
                          },
                          {
                            'title': 'Lesson 3: Stateful vs Stateless Widgets',
                            'content': 'Stateless widgets are immutable, meaning their properties cannot change—all values are final. Stateful widgets maintain dynamic state that can change over time. Calling setState triggers a rebuild of the widget\'s subtree with the updated state.'
                          },
                          {
                            'title': 'Lesson 4: Designing Custom Layouts',
                            'content': 'Flutter layout is based on a single-pass layout model. Parents pass down constraints, and children pass up sizes. You construct layouts using rows, columns, stacks, padding, and flexible widgets to achieve elegant, pixel-perfect responsiveness.'
                          }
                        ]
                      },
                      {
                        'name': 'Data Structures in Dart',
                        'details': '8 Lessons • 3h 15m',
                        'lessons': [
                          {
                            'title': 'Lesson 1: Introduction to Data Structures',
                            'content': 'A data structure is a specialized format for organizing, processing, retrieving, and storing data. Choosing the right data structure is crucial for application performance, memory footprint, and code maintainability.'
                          },
                          {
                            'title': 'Lesson 2: Understanding Linked Lists',
                            'content': 'A linked list is a linear collection of data elements called nodes. Unlike arrays, nodes are not stored sequentially in memory. Instead, each node contains a value and a pointer or reference to the next node in the sequence.'
                          },
                          {
                            'title': 'Lesson 3: Stacks & Queues in Practice',
                            'content': 'A stack is a Last-In-First-Out data structure, where elements are pushed onto the top and popped off. A queue is a First-In-First-Out structure, where elements are queued at the rear and dequeued at the front.'
                          },
                          {
                            'title': 'Lesson 4: Binary Trees & BST Operations',
                            'content': 'A binary tree is a hierarchical data structure where each node has at most two children, referred to as the left child and right child. A Binary Search Tree or BST maintains sorted order, allowing fast search, insert, and delete operations.'
                          }
                        ]
                      },
                      {
                        'name': 'Advanced State Management',
                        'details': '15 Lessons • 5h 45m',
                        'lessons': [
                          {
                            'title': 'Lesson 1: Introduction to State in Flutter',
                            'content': 'State is information that can be read synchronously when the widget is built and might change during the lifetime of the widget. Managing state across deep widget trees requires robust patterns beyond setState.'
                          },
                          {
                            'title': 'Lesson 2: The Provider Pattern',
                            'content': 'Provider is a wrapper around InheritedWidget to make them easier to use and more reusable. It allows you to expose state at the top of your widget tree and listen to updates lower down using Consumer widgets.'
                          },
                          {
                            'title': 'Lesson 3: Powering Up with Riverpod',
                            'content': 'Riverpod is a rewrite of Provider to make it compile-safe, testable, and free of context dependencies. It runs completely outside the Flutter widget tree, allowing you to access state globally while keeping builds efficient.'
                          },
                          {
                            'title': 'Lesson 4: Enterprise State with BLoC',
                            'content': 'The Business Logic Component or BLoC pattern separates the presentation layer from business logic. It relies on reactive programming with Streams, converting incoming events into outgoing states in a highly predictable way.'
                          }
                        ]
                      },
                    ],
                  ),

                  const SizedBox(height: 28),

                  _buildTrackCard(
                    context,
                    title: 'Non-Technical Skills',
                    description: 'Soft Skills, Business Communication, & Leadership.',
                    icon: LucideIcons.bookOpen,
                    accentColor: AppTheme.accentPrimary, // Indigo Accent
                    delay: 200,
                    courses: [
                      {
                        'name': 'Effective Communication',
                        'details': '10 Lessons • 3h 00m',
                        'lessons': [
                          {
                            'title': 'Lesson 1: Fundamentals of Clear Expression',
                            'content': 'Effective communication is the cornerstone of professional success. It involves expressing thoughts and ideas with absolute clarity, active listening, and understanding non-verbal cues to establish meaningful trust.'
                          },
                          {
                            'title': 'Lesson 2: Active Listening Techniques',
                            'content': 'Communication is a two-way street. Active listening is the practice of fully preparing to listen, observing verbal and non-verbal messages, and providing constructive feedback rather than just waiting for your turn to speak.'
                          },
                          {
                            'title': 'Lesson 3: The Power of Pitch and Cadence',
                            'content': 'Your voice is an instrument. Cadence, volume, and pitch control can transform a speech from a boring monologue into an inspiring presentation. Pausing strategically allows your audience to digest critical points.'
                          },
                          {
                            'title': 'Lesson 4: Navigating Difficult Conversations',
                            'content': 'Conflict is inevitable in any workplace. Navigating tough discussions requires emotional intelligence, empathy, and active validation. Focus on the core problem rather than personal friction to reach a collaborative outcome.'
                          }
                        ]
                      },
                      {
                        'name': 'Leadership Principles',
                        'details': '6 Lessons • 2h 20m',
                        'lessons': [
                          {
                            'title': 'Lesson 1: Defining Modern Leadership',
                            'content': 'Leadership is not defined by titles or authority. It is the ability to inspire, motivate, and empower others to achieve shared goals. Modern leaders focus on servant leadership, collaboration, and high empathy.'
                          },
                          {
                            'title': 'Lesson 2: Emotional Intelligence in Teams',
                            'content': 'Emotional Intelligence or EQ is the ability to understand and manage your own emotions, and recognize those of others. Leaders with high EQ create psychological safety, allowing teams to innovate without fear of failure.'
                          },
                          {
                            'title': 'Lesson 3: Visionary Alignment & Execution',
                            'content': 'A great leader doesn\'t just delegate tasks; they paint a compelling picture of the future. Aligning individual contributions with the organizational vision inspires higher engagement and drives long-term success.'
                          },
                          {
                            'title': 'Lesson 4: Feedback Loops & Mentorship',
                            'content': 'Leadership is about growing more leaders, not followers. Constructive feedback loops, paired with positive reinforcement and intentional mentorship, accelerate personal development and build resilient teams.'
                          }
                        ]
                      },
                      {
                        'name': 'Time Management Mastery',
                        'details': '5 Lessons • 1h 45m',
                        'lessons': [
                          {
                            'title': 'Lesson 1: The Psychology of Productivity',
                            'content': 'Time is our most limited resource. Mastering time management is not about working longer hours, but optimizing focus. It requires understanding cognitive energy levels and eliminating high-friction distractions.'
                          },
                          {
                            'title': 'Lesson 2: Prioritization Frameworks',
                            'content': 'The Eisenhower Matrix categorizes tasks into four quadrants: urgent and important, important but not urgent, urgent but not important, and neither. Prioritizing the \'important but not urgent\' quadrant prevents burnout.'
                          },
                          {
                            'title': 'Lesson 3: Time Blocking & Pomodoro',
                            'content': 'Time blocking involves dividing your day into dedicated chunks of time for specific activities. Combined with the Pomodoro technique—25 minutes of hyper-focus followed by a 5-minute break—it maintains optimal cognitive performance.'
                          },
                          {
                            'title': 'Lesson 4: Designing High-Impact Routines',
                            'content': 'Consistency builds momentum. Designing deliberate morning and evening routines helps automate baseline productivity. Minimizing decision fatigue early in the day preserves creative energy for complex tasks.'
                          }
                        ]
                      },
                    ],
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

  Widget _buildTrackCard(
    BuildContext context, {
    required String title,
    required String description,
    required IconData icon,
    required Color accentColor,
    required int delay,
    required List<Map<String, dynamic>> courses,
  }) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: AppTheme.glassDecorationWithAccent(accentColor),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [accentColor, accentColor.withOpacity(0.5)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: accentColor.withOpacity(0.2),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    )
                  ],
                ),
                child: Icon(icon, color: Colors.white, size: 26),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: const TextStyle(
                        fontFamily: 'Lexend',
                        fontSize: 20,
                        fontWeight: FontWeight.w800,
                        color: Colors.white,
                        letterSpacing: -0.5,
                      ),
                    ),
                    const SizedBox(height: 4),
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
            ],
          ),
          const SizedBox(height: 24),
          ...courses.map((course) {
            return Padding(
              padding: const EdgeInsets.only(bottom: 14.0),
              child: _buildCourseItem(context, course, accentColor),
            );
          }).toList(),
        ],
      ),
    ).animate().fade(delay: delay.ms).slideY(begin: 0.08);
  }

  Widget _buildCourseItem(BuildContext context, Map<String, dynamic> course, Color themeColor) {
    return GestureDetector(
      onTap: () {
        context.push('/lecture', extra: <String, dynamic>{
          'courseName': course['name'] ?? '',
          'lessons': course['lessons'] ?? [],
        });
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.03),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppTheme.border, width: 1.0),
        ),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    course['name'] as String,
                    style: const TextStyle(
                      fontFamily: 'Lexend',
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    course['details'] as String,
                    style: const TextStyle(
                      fontFamily: 'Lexend',
                      fontSize: 13,
                      fontWeight: FontWeight.w500,
                      color: AppTheme.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 12),
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: themeColor.withOpacity(0.15),
                shape: BoxShape.circle,
              ),
              child: Icon(LucideIcons.play, color: themeColor, size: 18),
            ),
          ],
        ),
      ),
    );
  }
}
