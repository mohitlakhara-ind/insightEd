import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_tts/flutter_tts.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../theme.dart';

class StoryTellingScreen extends StatefulWidget {
  const StoryTellingScreen({super.key});

  @override
  State<StoryTellingScreen> createState() => _StoryTellingScreenState();
}

class _StoryTellingScreenState extends State<StoryTellingScreen> {
  final FlutterTts flutterTts = FlutterTts();
  bool _isSpeaking = false;
  int _currentStoryIndex = 0;

  final List<Map<String, String>> stories = [
    {
      'title': 'The Potato, The Egg, And The Coffee Beans',
      'content': "A boy named John was upset. His father found him crying. When his father asked John why he was crying, he said that he had a lot of problems in his life. His father simply smiled and asked him to get a potato, an egg, and some coffee beans. He placed them in three bowls. He then asked John to feel their texture and then fill each bowl with water. John did as he had been told. His father then boiled all three bowls. Once the bowls had cooled down, John's father asked him to feel the texture of the different food items again. John noticed that the potato had become soft and its skin was peeling off easily; the egg had become harder; the coffee beans had completely changed and filled the bowl of water with aroma and flavour.\n\nMoral of the story: Life will always have problems and pressures, like the boiling water in the story. It's how you respond and react to these problems that counts the most!",
    },
    {
      'title': 'The Lion And The Mouse',
      'content': "Once a lion was sleeping in his jungle home when a mouse accidentally ran across his body. The lion woke up and grabbed the tiny mouse. He was about to eat the mouse when it begged for mercy. The mouse said, 'Please let me go, and one day I will help you.' The lion laughed at the idea of a small mouse helping a mighty lion, but let it go. Sometime later, the lion got caught in a hunter's net. He roared loudly. The mouse heard his roar and came running. The mouse gnawed through the ropes and set the lion free.\n\nMoral: No act of kindness is ever wasted. Even the smallest friends can be the mightiest allies.",
    },
    {
      'title': 'The MilkMaid And Her Pail',
      'content': "Patty the Milkmaid was going to market carrying her milk in a pail on her head. As she walked along, she began calculating what she would do with the money she'd get for the milk. 'I'll buy some fowls from Farmer Brown,' said she, 'and they will lay eggs each morning, which I will sell to the parson's wife. With the money that I get from the sale of these eggs, I'll buy myself a new dimity frock and a chip hat.' She was so lost in her dreams that she tossed her head back. The pail fell off, and all the milk spilled.\n\nMoral: Do not count your chickens before they are hatched.",
    },
    {
      'title': 'Two Frogs With The Same Problem',
      'content': "A group of frogs was traveling through the woods. Two of them fell into a deep pit. The other frogs told them they were as good as dead. The two frogs ignored the comments and tried to jump out. The others kept telling them to stop. Finally, one frog gave up and died. The other continued to jump. The crowd yelled at him to stop. He jumped even harder and finally made it out. When he got out, the other frogs asked him, 'Did you not hear us?' The frog explained that he was deaf. He thought they were encouraging him the entire time.\n\nMoral: An encouraging word to someone who is down can lift them up and help them make it through the day.",
    },
  ];

  @override
  void initState() {
    super.initState();
    flutterTts.setLanguage("en-US");
    flutterTts.setSpeechRate(0.45);
    flutterTts.setCompletionHandler(() {
      if (mounted) setState(() => _isSpeaking = false);
    });
  }

  @override
  void dispose() {
    flutterTts.stop();
    super.dispose();
  }

  void _toggleSpeak() async {
    if (_isSpeaking) {
      await flutterTts.stop();
      setState(() => _isSpeaking = false);
    } else {
      setState(() => _isSpeaking = true);
      await flutterTts.speak(stories[_currentStoryIndex]['content']!);
    }
  }

  @override
  Widget build(BuildContext context) {
    final story = stories[_currentStoryIndex];
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(LucideIcons.arrowLeft, color: AppTheme.accentPrimary),
          onPressed: () => context.pop(),
        ),
        title: const Text('Storytelling Arena'),
      ),
      body: SafeArea(
        child: Stack(
          children: [
            // Decorative backdrop glow
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
                  filter: ImageFilter.blur(sigmaX: 80, sigmaY: 80),
                  child: Container(color: Colors.transparent),
                ),
              ),
            ),
            Positioned(
              bottom: 40,
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

            Column(
              children: [
                // Voice Command Banner
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 8),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                    decoration: AppTheme.glassDecorationWithAccent(AppTheme.accentSecondary),
                    child: Row(
                      children: [
                        const Icon(LucideIcons.mic, color: AppTheme.accentSecondary, size: 24),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            'Say "read story" or "next story" for voice control.',
                            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                  fontWeight: FontWeight.w600,
                                  color: AppTheme.textSecondary,
                                ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ).animate().fade(),

                const SizedBox(height: 16),

                // Horizontal Selector with Lexend font
                SizedBox(
                  height: 52,
                  child: ListView.builder(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.symmetric(horizontal: 24),
                    itemCount: stories.length,
                    itemBuilder: (context, index) {
                      final isSelected = index == _currentStoryIndex;
                      return Padding(
                        padding: const EdgeInsets.only(right: 12),
                        child: GestureDetector(
                          onTap: () {
                            flutterTts.stop();
                            setState(() {
                              _currentStoryIndex = index;
                              _isSpeaking = false;
                            });
                          },
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 250),
                            padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 12),
                            decoration: BoxDecoration(
                              gradient: isSelected ? AppTheme.secondaryGradient : null,
                              color: isSelected ? null : AppTheme.surfaceElevated,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(
                                color: isSelected ? AppTheme.accentSecondary.withOpacity(0.4) : AppTheme.border,
                                width: 1.0,
                              ),
                              boxShadow: isSelected
                                  ? [
                                      BoxShadow(
                                        color: AppTheme.accentSecondary.withOpacity(0.2),
                                        blurRadius: 12,
                                        offset: const Offset(0, 4),
                                      )
                                    ]
                                  : null,
                            ),
                            child: Center(
                              child: Text(
                                'STORY ${index + 1}',
                                style: TextStyle(
                                  fontFamily: 'Lexend',
                                  color: isSelected ? Colors.white : AppTheme.textSecondary,
                                  fontWeight: FontWeight.w800,
                                  fontSize: 13,
                                  letterSpacing: 0.5,
                                ),
                              ),
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),

                const SizedBox(height: 24),

                // Story title
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  child: Text(
                    story['title']!,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontFamily: 'Lexend',
                      fontSize: 22,
                      fontWeight: FontWeight.w800,
                      color: AppTheme.accentPrimary,
                      letterSpacing: -0.5,
                    ),
                  ),
                ).animate().fade(),

                const SizedBox(height: 16),

                // Story content inside bento card container
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 24),
                    child: Container(
                      padding: const EdgeInsets.all(24),
                      decoration: AppTheme.glassDecoration,
                      child: SingleChildScrollView(
                        child: Text(
                          story['content']!,
                          style: const TextStyle(
                            fontFamily: 'Lexend',
                            color: AppTheme.textPrimary,
                            fontSize: 17,
                            fontWeight: FontWeight.w400,
                            height: 1.6,
                          ),
                        ),
                      ),
                    ),
                  ),
                ),

                const SizedBox(height: 24),

                // Controls
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  child: Row(
                    children: [
                      Expanded(
                        child: SizedBox(
                          height: 60,
                          child: ElevatedButton.icon(
                            onPressed: _toggleSpeak,
                            icon: Icon(
                              _isSpeaking ? LucideIcons.square : LucideIcons.volume2,
                              size: 22,
                              color: Colors.white,
                            ),
                            label: Text(_isSpeaking ? 'STOP' : 'LISTEN'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: _isSpeaking ? AppTheme.accentError : AppTheme.accentPrimary,
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
                            onPressed: () => context.push('/quiz'),
                            icon: const Icon(
                              LucideIcons.helpCircle,
                              size: 22,
                              color: Colors.white,
                            ),
                            label: const Text('TAKE QUIZ'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppTheme.accentSecondary,
                              foregroundColor: Colors.white,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(16),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 18),

                Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: Text(
                    'New stories added daily!',
                    style: TextStyle(
                      fontFamily: 'Lexend',
                      color: AppTheme.textMuted,
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
