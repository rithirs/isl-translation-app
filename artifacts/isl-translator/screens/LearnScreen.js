import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '@/constants/colors';

const categories = [
  'Greetings',
  'Daily Conversation',
  'Family',
  'Education',
  'Food',
  'Travel',
  'Emergency',
  'Numbers',
  'Common Phrases',
];

const signsByCategory = {
  Greetings: [
    { label: 'HELLO', icon: 'smile' },
    { label: 'GOOD MORNING', icon: 'sunrise' },
    { label: 'GOOD EVENING', icon: 'moon' },
    { label: 'WELCOME', icon: 'home' },
  ],
  'Daily Conversation': [
    { label: 'HOW ARE YOU?', icon: 'message-circle' },
    { label: 'I AM FINE', icon: 'thumbs-up' },
    { label: 'PLEASE', icon: 'heart' },
    { label: 'THANK YOU', icon: 'heart' },
  ],
  Family: [
    { label: 'MOTHER', icon: 'user' },
    { label: 'FATHER', icon: 'user' },
    { label: 'SISTER', icon: 'users' },
    { label: 'FAMILY', icon: 'users' },
  ],
  Education: [
    { label: 'SCHOOL', icon: 'book-open' },
    { label: 'TEACHER', icon: 'briefcase' },
    { label: 'STUDY', icon: 'book' },
    { label: 'CLASS', icon: 'layers' },
  ],
  Food: [
    { label: 'WATER', icon: 'droplet' },
    { label: 'FOOD', icon: 'coffee' },
    { label: 'BREAKFAST', icon: 'sunrise' },
    { label: 'DELICIOUS', icon: 'star' },
  ],
  Travel: [
    { label: 'BUS', icon: 'truck' },
    { label: 'TRAIN', icon: 'navigation' },
    { label: 'HOTEL', icon: 'home' },
    { label: 'TICKET', icon: 'credit-card' },
  ],
  Emergency: [
    { label: 'HELP', icon: 'alert-circle' },
    { label: 'CALL POLICE', icon: 'phone' },
    { label: 'HOSPITAL', icon: 'plus-circle' },
    { label: 'DANGER', icon: 'alert-triangle' },
  ],
  Numbers: [
    { label: 'ONE', icon: 'hash' },
    { label: 'TWO', icon: 'hash' },
    { label: 'TEN', icon: 'hash' },
    { label: 'HUNDRED', icon: 'hash' },
  ],
  'Common Phrases': [
    { label: 'YES', icon: 'check' },
    { label: 'NO', icon: 'x' },
    { label: 'SORRY', icon: 'corner-down-left' },
    { label: 'SEE YOU', icon: 'smile' },
  ],
};

export default function LearnScreen() {
  const insets = useSafeAreaInsets();
  const [activeCategory, setActiveCategory] = useState('Greetings');
  const styles = useMemo(() => createStyles(colors.light), []);
  const signs = signsByCategory[activeCategory];

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingBottom: Math.max(insets.bottom + 78, 96) },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Learn ISL</Text>
              <Text style={styles.subtitle}>Browse sign categories and practice vocabulary</Text>
            </View>
            <View style={styles.headerMark}>
              <Feather name="book-open" size={18} color={colors.light.primary} />
            </View>
          </View>

          <ScrollView
            contentContainerStyle={styles.categoryContent}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {categories.map((category) => {
              const isActive = category === activeCategory;
              return (
                <TouchableOpacity
                  accessibilityLabel={`Show ${category} signs`}
                  accessibilityRole="button"
                  activeOpacity={0.78}
                  key={category}
                  onPress={() => setActiveCategory(category)}
                  style={[styles.categoryChip, isActive && styles.categoryChipActive]}
                  testID={`category-${category.toLowerCase().replaceAll(' ', '-')}`}
                >
                  <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{activeCategory}</Text>
            <Text style={styles.signCount}>{signs.length} signs</Text>
          </View>

          <View style={styles.grid}>
            {signs.map((sign) => (
              <TouchableOpacity
                accessibilityLabel={`Play ${sign.label} sign`}
                accessibilityRole="button"
                activeOpacity={0.82}
                key={sign.label}
                onPress={() => {}}
                style={styles.signCard}
              >
                <View style={styles.signCardHeader}>
                  <Text style={styles.signLabel}>{sign.label}</Text>
                  <Feather name="more-horizontal" size={17} color={colors.light.mutedForeground} />
                </View>
                <View style={styles.previewBox}>
                  <View style={styles.previewOrb}>
                    <Feather name={sign.icon} size={22} color={colors.light.primary} />
                  </View>
                  <View style={styles.previewPlay}>
                    <Feather name="play" size={13} color={colors.light.primaryForeground} />
                  </View>
                  <Text style={styles.previewLabel}>Preview sign</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>

      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <BottomTab
          icon="home"
          label="Home"
          onPress={() => router.replace('/')}
          styles={styles}
        />
        <BottomTab
          icon="message-square"
          label="Translate"
          onPress={() => router.push('/translate')}
          styles={styles}
        />
        <BottomTab
          active
          icon="book-open"
          label="Learn"
          onPress={() => {}}
          styles={styles}
        />
      </View>
    </View>
  );
}

function BottomTab({ active = false, icon, label, onPress, styles }) {
  return (
    <Pressable
      accessibilityLabel={`${label} tab`}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [styles.navItem, pressed && styles.pressed]}
      testID={`learn-tab-${label.toLowerCase()}`}
    >
      <Feather
        name={icon}
        size={19}
        color={active ? colors.light.primary : colors.light.mutedForeground}
      />
      <Text style={[styles.navLabel, active && styles.navLabelActive]}>{label}</Text>
      <View style={[styles.activeLine, !active && styles.inactiveLine]} />
    </Pressable>
  );
}

function createStyles(palette) {
  return StyleSheet.create({
    screen: {
      backgroundColor: palette.background,
      flex: 1,
    },
    safeArea: {
      flex: 1,
    },
    content: {
      paddingHorizontal: 22,
      paddingTop: Platform.OS === 'web' ? 20 : 10,
    },
    header: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    title: {
      color: palette.foreground,
      fontFamily: 'Inter_700Bold',
      fontSize: 24,
      letterSpacing: -0.7,
    },
    subtitle: {
      color: palette.mutedForeground,
      fontFamily: 'Inter_400Regular',
      fontSize: 13,
      marginTop: 6,
    },
    headerMark: {
      alignItems: 'center',
      backgroundColor: palette.accent,
      borderRadius: 21,
      height: 42,
      justifyContent: 'center',
      width: 42,
    },
    categoryContent: {
      gap: 8,
      paddingVertical: 24,
    },
    categoryChip: {
      backgroundColor: palette.card,
      borderColor: palette.border,
      borderRadius: 19,
      borderWidth: 1,
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    categoryChipActive: {
      backgroundColor: palette.primary,
      borderColor: palette.primary,
    },
    categoryText: {
      color: palette.mutedForeground,
      fontFamily: 'Inter_500Medium',
      fontSize: 12,
    },
    categoryTextActive: {
      color: palette.primaryForeground,
      fontFamily: 'Inter_600SemiBold',
    },
    sectionHeader: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 14,
    },
    sectionTitle: {
      color: palette.foreground,
      fontFamily: 'Inter_700Bold',
      fontSize: 17,
      letterSpacing: -0.2,
    },
    signCount: {
      color: palette.mutedForeground,
      fontFamily: 'Inter_400Regular',
      fontSize: 12,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 14,
      justifyContent: 'space-between',
    },
    signCard: {
      backgroundColor: palette.card,
      borderColor: palette.border,
      borderRadius: 20,
      borderWidth: 1,
      marginBottom: 2,
      minHeight: 191,
      padding: 12,
      width: '48%',
    },
    signCardHeader: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      minHeight: 28,
    },
    signLabel: {
      color: palette.cardForeground,
      flex: 1,
      fontFamily: 'Inter_700Bold',
      fontSize: 12,
      letterSpacing: 0.35,
    },
    previewBox: {
      alignItems: 'center',
      backgroundColor: palette.secondary,
      borderRadius: 15,
      flex: 1,
      justifyContent: 'center',
      marginTop: 9,
      minHeight: 133,
      overflow: 'hidden',
      position: 'relative',
    },
    previewOrb: {
      alignItems: 'center',
      backgroundColor: palette.accent,
      borderRadius: 30,
      height: 58,
      justifyContent: 'center',
      width: 58,
    },
    previewPlay: {
      alignItems: 'center',
      backgroundColor: palette.primary,
      borderRadius: 16,
      bottom: 10,
      height: 32,
      justifyContent: 'center',
      position: 'absolute',
      right: 10,
      width: 32,
    },
    previewLabel: {
      bottom: 9,
      color: palette.mutedForeground,
      fontFamily: 'Inter_500Medium',
      fontSize: 9,
      left: 10,
      position: 'absolute',
    },
    bottomBar: {
      alignItems: 'flex-start',
      backgroundColor: palette.card,
      borderColor: palette.border,
      borderTopWidth: 1,
      bottom: 0,
      flexDirection: 'row',
      justifyContent: 'space-around',
      left: 0,
      paddingHorizontal: 14,
      paddingTop: 12,
      position: 'absolute',
      right: 0,
    },
    navItem: {
      alignItems: 'center',
      minWidth: 74,
    },
    navLabel: {
      color: palette.mutedForeground,
      fontFamily: 'Inter_500Medium',
      fontSize: 11,
      marginTop: 5,
    },
    navLabelActive: {
      color: palette.primary,
      fontFamily: 'Inter_700Bold',
    },
    activeLine: {
      backgroundColor: palette.primary,
      borderRadius: 2,
      height: 3,
      marginTop: 8,
      width: 22,
    },
    inactiveLine: {
      opacity: 0,
    },
    pressed: {
      opacity: 0.72,
    },
  });
}