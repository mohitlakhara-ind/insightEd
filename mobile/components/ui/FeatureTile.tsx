import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { fonts } from '@/constants/typography';

type FeatureTileProps = {
  title: string;
  subtitle: string;
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  colors: {
    accent: string;
    accentMuted: string;
    text: string;
    textSecondary: string;
    border: string;
    surface: string;
  };
  onPress: () => void;
};

export function FeatureTile({
  title,
  subtitle,
  icon,
  colors,
  onPress,
}: FeatureTileProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${subtitle}`}
      style={({ pressed }) => [
        styles.tile,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: colors.accentMuted }]}>
        <FontAwesome name={icon} size={24} color={colors.accent} />
      </View>
      <Text style={[styles.title, { color: colors.text, fontFamily: fonts.bold }]}>
        {title}
      </Text>
      <Text
        style={[
          styles.subtitle,
          { color: colors.textSecondary, fontFamily: fonts.regular },
        ]}
      >
        {subtitle}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    minWidth: '46%',
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    gap: 8,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
});
