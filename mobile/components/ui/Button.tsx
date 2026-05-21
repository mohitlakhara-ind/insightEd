import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { fonts } from '@/constants/typography';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

type ButtonProps = PressableProps & {
  label: string;
  variant?: Variant;
  loading?: boolean;
  colors: {
    accent: string;
    accentFg: string;
    surface: string;
    text: string;
    border: string;
  };
};

export function Button({
  label,
  variant = 'primary',
  loading,
  colors,
  disabled,
  style,
  ...props
}: ButtonProps & { style?: StyleProp<ViewStyle> }) {
  const variantStyle =
    variant === 'primary'
      ? { backgroundColor: colors.accent }
      : variant === 'danger'
        ? { backgroundColor: '#e11d48' }
        : variant === 'secondary'
          ? { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }
          : { backgroundColor: 'transparent' };

  const textColor =
    variant === 'primary' || variant === 'danger'
      ? colors.accentFg
      : colors.text;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      style={({ pressed }) =>
        [
          styles.base,
          variantStyle,
          (disabled || loading) && styles.disabled,
          pressed && styles.pressed,
          style,
        ] as StyleProp<ViewStyle>
      }
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.label, { color: textColor, fontFamily: fonts.bold }]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 16,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.85,
  },
});
