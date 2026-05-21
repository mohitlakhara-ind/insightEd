import 'dart:ui';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../theme.dart';

class SignInScreen extends StatefulWidget {
  const SignInScreen({super.key});

  @override
  State<SignInScreen> createState() => _SignInScreenState();
}

class _SignInScreenState extends State<SignInScreen> {
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLogin = true;
  bool _isLoading = false;
  bool _obscurePassword = true;

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final name = _nameController.text.trim();
    final email = _emailController.text.trim();
    final password = _passwordController.text.trim();

    if (!_isLogin && name.isEmpty) {
      _showSnack('Please enter your name');
      return;
    }
    if (email.isEmpty) {
      _showSnack('Please enter your email address');
      return;
    }
    if (!RegExp(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]+$').hasMatch(email)) {
      _showSnack('Please enter a valid email address');
      return;
    }
    if (password.isEmpty) {
      _showSnack('Please enter your password');
      return;
    }
    if (password.length < 6) {
      _showSnack('Password must be at least 6 characters');
      return;
    }

    setState(() => _isLoading = true);

    try {
      if (_isLogin) {
        // Sign in with Firebase Auth
        final userCredential = await FirebaseAuth.instance.signInWithEmailAndPassword(
          email: email,
          password: password,
        );
        final user = userCredential.user;

        if (user != null) {
          // Check if user document exists in Firestore
          final userDoc = await FirebaseFirestore.instance
              .collection('users')
              .doc(user.uid)
              .get();

          if (!userDoc.exists) {
            // Sign out user and ask them to sign up
            await FirebaseAuth.instance.signOut();
            _showSnack('No user account found. Please sign up instead of logging in.');
            setState(() {
              _isLogin = false; // switch to sign up tab
            });
            if (mounted) setState(() => _isLoading = false);
            return;
          }
        }
      } else {
        // Sign up: create user with Firebase Auth
        final userCredential = await FirebaseAuth.instance.createUserWithEmailAndPassword(
          email: email,
          password: password,
        );
        final user = userCredential.user;

        if (user != null) {
          // Update displayName in auth profile
          await user.updateDisplayName(name);

          // Store profile data in Firestore
          await FirebaseFirestore.instance.collection('users').doc(user.uid).set({
            'uid': user.uid,
            'email': email,
            'displayName': name,
            'role': (email.endsWith('@insighted.org') || email == 'admin@insighted.com') ? 'educator' : 'student',
            'createdAt': DateTime.now().toIso8601String(),
          });
        }
      }
      if (mounted) context.go('/');
    } on FirebaseAuthException catch (e) {
      if (e.code == 'user-not-found' || e.code == 'invalid-credential') {
        _showSnack('No user account found. Please sign up instead of logging in.');
        setState(() {
          _isLogin = false; // switch to sign up tab
        });
      } else {
        _showSnack(e.message ?? 'Authentication failed');
      }
    } catch (e) {
      debugPrint('Auth error: $e');
      _showSnack('Authentication failed: $e');
    }
    if (mounted) setState(() => _isLoading = false);
  }

  Future<void> _forgotPassword() async {
    final email = _emailController.text.trim();
    if (email.isEmpty) {
      _showSnack('Please enter your email first');
      return;
    }
    if (kIsWeb) {
      _showSnack('Password reset is simulated on web demo.');
      return;
    }
    try {
      await FirebaseAuth.instance.sendPasswordResetEmail(email: email);
      _showSnack('Password reset link sent to your email');
    } catch (e) {
      _showSnack('Could not send reset email. Firebase may not be configured.');
    }
  }

  void _showSnack(String msg) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).clearSnackBars();
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(
        msg,
        style: const TextStyle(
          color: Colors.white,
          fontFamily: 'Lexend',
          fontWeight: FontWeight.w600,
          fontSize: 15,
        ),
      ),
      backgroundColor: AppTheme.background.withOpacity(0.9),
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: const BorderSide(color: AppTheme.border, width: 1),
      ),
    ));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      body: SafeArea(
        child: Stack(
          children: [
            // Ambient glowing background blobs for visual premium feel
            Positioned(
              top: -80,
              left: -100,
              child: Container(
                width: 320,
                height: 320,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppTheme.accentPrimary.withOpacity(0.09),
                ),
                child: BackdropFilter(
                  filter: ImageFilter.blur(sigmaX: 90, sigmaY: 90),
                  child: Container(color: Colors.transparent),
                ),
              ),
            ),
            Positioned(
              bottom: -100,
              right: -80,
              child: Container(
                width: 300,
                height: 300,
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

            Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 36),
                  decoration: AppTheme.glassDecoration,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Center(
                        child: Container(
                          padding: const EdgeInsets.all(18),
                          decoration: BoxDecoration(
                            gradient: AppTheme.primaryGradient,
                            shape: BoxShape.circle,
                            boxShadow: [
                              BoxShadow(
                                color: AppTheme.accentPrimary.withOpacity(0.3),
                                blurRadius: 20,
                                spreadRadius: 2,
                              )
                            ],
                          ),
                          child: const Icon(LucideIcons.sparkles, size: 36, color: Colors.white),
                        ),
                      ).animate().scale(delay: 100.ms).fade(),

                      const SizedBox(height: 24),

                      Text(
                        'InsightEd',
                        textAlign: TextAlign.center,
                        style: Theme.of(context).textTheme.displayLarge?.copyWith(
                              fontSize: 34,
                              fontWeight: FontWeight.w800,
                              color: Colors.white,
                              letterSpacing: -0.8,
                            ),
                      ).animate().fade(delay: 200.ms).slideY(begin: 0.08),

                      const SizedBox(height: 8),

                      Text(
                        _isLogin
                            ? 'Sign in to access voice learning modules'
                            : 'Create a learning profile to begin',
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          fontFamily: 'Lexend',
                          color: AppTheme.textSecondary,
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                        ),
                      ).animate().fade(delay: 300.ms),

                      const SizedBox(height: 36),

                      if (!_isLogin) ...[
                        _buildTextField(
                          controller: _nameController,
                          hint: 'Full Name',
                          icon: LucideIcons.user,
                          delay: 350,
                        ),
                        const SizedBox(height: 18),
                      ],

                      _buildTextField(
                        controller: _emailController,
                        hint: 'Email Address',
                        icon: LucideIcons.mail,
                        delay: 400,
                      ),

                      const SizedBox(height: 18),

                      _buildTextField(
                        controller: _passwordController,
                        hint: 'Password',
                        icon: LucideIcons.lock,
                        delay: 500,
                        obscure: _obscurePassword,
                        suffix: IconButton(
                          icon: Icon(
                            _obscurePassword ? LucideIcons.eyeOff : LucideIcons.eye,
                            color: AppTheme.accentSecondary.withOpacity(0.7),
                            size: 20,
                          ),
                          onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                        ),
                      ),

                      const SizedBox(height: 12),

                      if (_isLogin)
                        Align(
                          alignment: Alignment.centerRight,
                          child: TextButton(
                            onPressed: _forgotPassword,
                            child: const Text(
                              'Forgot Password?',
                              style: TextStyle(
                                fontFamily: 'Lexend',
                                color: AppTheme.accentSecondary,
                                fontWeight: FontWeight.w700,
                                fontSize: 13,
                              ),
                            ),
                          ),
                        ).animate().fade(delay: 550.ms),

                      const SizedBox(height: 28),

                      SizedBox(
                        height: 56,
                        child: ElevatedButton(
                          onPressed: _isLoading ? null : _submit,
                          style: ElevatedButton.styleFrom(
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16),
                            ),
                          ),
                          child: _isLoading
                              ? const SizedBox(
                                  width: 22,
                                  height: 22,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2.5,
                                    color: Colors.white,
                                  ),
                                )
                              : Text(
                                  _isLogin ? 'SIGN IN' : 'CREATE ACCOUNT',
                                  style: const TextStyle(
                                    fontFamily: 'Lexend',
                                    fontSize: 16,
                                    fontWeight: FontWeight.w800,
                                  ),
                                ),
                        ),
                      ).animate().fade(delay: 600.ms).scale(),

                      const SizedBox(height: 24),

                      Wrap(
                        alignment: WrapAlignment.center,
                        crossAxisAlignment: WrapCrossAlignment.center,
                        spacing: 4,
                        children: [
                          Text(
                            _isLogin ? "New user?" : "Existing user?",
                            style: const TextStyle(
                              fontFamily: 'Lexend',
                              color: AppTheme.textSecondary,
                              fontSize: 14,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          GestureDetector(
                            onTap: () => setState(() => _isLogin = !_isLogin),
                            child: Text(
                              _isLogin ? 'Sign Up' : 'Sign In',
                              style: const TextStyle(
                                fontFamily: 'Lexend',
                                color: AppTheme.accentSecondary,
                                fontWeight: FontWeight.w800,
                                fontSize: 14,
                                decoration: TextDecoration.underline,
                              ),
                            ),
                          ),
                        ],
                      ).animate().fade(delay: 700.ms),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String hint,
    required IconData icon,
    required int delay,
    bool obscure = false,
    Widget? suffix,
  }) {
    return TextField(
      controller: controller,
      obscureText: obscure,
      style: const TextStyle(
        fontFamily: 'Lexend',
        color: Colors.white,
        fontSize: 15,
        fontWeight: FontWeight.w600,
      ),
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: TextStyle(
          fontFamily: 'Lexend',
          color: Colors.white.withOpacity(0.35),
          fontWeight: FontWeight.w500,
        ),
        prefixIcon: Icon(icon, color: AppTheme.accentPrimary.withOpacity(0.8), size: 20),
        suffixIcon: suffix,
        filled: true,
        fillColor: Colors.white.withOpacity(0.04),
        contentPadding: const EdgeInsets.symmetric(vertical: 18, horizontal: 16),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: AppTheme.border, width: 1.0),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: AppTheme.border, width: 1.0),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: AppTheme.accentSecondary, width: 1.2),
        ),
      ),
    ).animate().fade(delay: delay.ms).slideY(begin: 0.08);
  }
}
