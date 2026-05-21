import 'package:flutter_test/flutter_test.dart';
import 'package:insight_ed_mobile/main.dart';

void main() {
  testWidgets('InsightEd Mobile UI sanity test', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const InsightEdMobileApp());

    // Allow any initial animations to settle
    await tester.pumpAndSettle();

    // Basic assertion that the initial widget tree executes
    expect(find.byType(InsightEdMobileApp), findsOneWidget);
  });
}
