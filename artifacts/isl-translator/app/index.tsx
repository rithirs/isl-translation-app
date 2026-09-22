import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '@/constants/colors';

type Tab = 'Home' | 'Translate' | 'Learn';

const recentPhrases = [
  { label: 'Hello', icon: 'smile' as const },
  { label: 'Thank you', icon: 'heart' as const },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [isDark, setIsDark] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('Home');
  const [playingPhrase, setPlayingPhrase] = useState<string | null>(null);

  const palette = isDark ? colors.dark : colors.light;
  const styles = useMemo(() => createStyles(palette), [palette]);

  const handleTranslate = () => {
    router.push('/translate');
  };

  const handleTabPress = (tab: Tab) => {
    setActiveTab(tab);
    if (tab === 'Home') {
      router.replace('/');
    } else if (tab === 'Translate') {
      router.push('/translate');
    } else {
      router.push('/learn');
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={palette.background}
      />
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>ISL Translator</Text>
            <Pressable
              accessibilityLabel={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
              accessibilityRole="button"
              onPress={() => setIsDark((current) => !current)}
              style={({ pressed }) => [styles.themeButton, pressed && styles.pressed]}
              testID="theme-toggle"
            >
              <Feather
                name={isDark ? 'moon' : 'sun'}
                size={19}
                color={palette.primary}
              />
            </Pressable>
          </View>

          <View style={styles.welcome}>
            <Text style={styles.eyebrow}>A little more understanding</Text>
            <Text style={styles.tagline}>Communicate{'\n'}without barriers</Text>
            <Text style={styles.welcomeCopy}>
              Make every conversation feel closer, one sign at a time.
            </Text>
          </View>

          <Pressable
            accessibilityLabel="Translate English or Tamil into Indian Sign Language"
            accessibilityRole="button"
            onPress={handleTranslate}
            style={({ pressed }) => [styles.translateCard, pressed && styles.cardPressed]}
            testID="translate-card"
          >
            <View style={styles.translateTop}>
              <View style={styles.translateIcon}>
                <Feather name="edit-3" size={19} color={palette.primary} />
              </View>
              <Feather name="arrow-up-right" size={21} color={palette.primary} />
            </View>
            <View>
              <Text style={styles.cardTitle}>Translate Text</Text>
              <Text style={styles.cardSubtitle}>Convert English or Tamil into ISL</Text>
            </View>
            <View style={styles.goRow}>
              <Text style={styles.goText}>Go</Text>
              <Feather name="arrow-right" size={16} color={palette.primary} />
            </View>
          </Pressable>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent translations</Text>
            <Feather name="clock" size={17} color={palette.mutedForeground} />
          </View>

          <View style={styles.recentRow}>
            {recentPhrases.map((phrase) => {
              const isPlaying = playingPhrase === phrase.label;
              return (
                <Pressable
                  accessibilityLabel={`Play ${phrase.label} translation`}
                  accessibilityRole="button"
                  key={phrase.label}
                  onPress={() =>
                    setPlayingPhrase((current) =>
                      current === phrase.label ? null : phrase.label,
                    )
                  }
                  style={({ pressed }) => [
                    styles.recentCard,
                    isPlaying && styles.recentCardActive,
                    pressed && styles.cardPressed,
                  ]}
                  testID={`recent-${phrase.label.toLowerCase().replace(' ', '-')}`}
                >
                  <View style={[styles.phraseIcon, isPlaying && styles.phraseIconActive]}>
                    <Feather
                      name={phrase.icon}
                      size={18}
                      color={isPlaying ? palette.card : palette.primary}
                    />
                  </View>
                  <Text style={styles.phraseLabel}>{phrase.label}</Text>
                  <View style={[styles.playButton, isPlaying && styles.playButtonActive]}>
                    <Feather
                      name={isPlaying ? 'pause' : 'play'}
                      size={14}
                      color={isPlaying ? palette.primary : palette.card}
                    />
                  </View>
                  {isPlaying ? <Text style={styles.playingLabel}>Playing</Text> : null}
                </Pressable>
              );
            })}
          </View>

          <View style={styles.tip}>
            <View style={styles.tipIcon}>
              <Feather name="heart" size={16} color={palette.destructive} />
            </View>
            <View style={styles.tipCopy}>
              <Text style={styles.tipTitle}>Keep practicing</Text>
              <Text style={styles.tipText}>Small moments of practice add up.</Text>
            </View>
            <Feather name="chevron-right" size={18} color={palette.mutedForeground} />
          </View>
        </ScrollView>
      </SafeAreaView>

      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        {(['Home', 'Translate', 'Learn'] as Tab[]).map((tab) => {
          const isActive = activeTab === tab;
          const icon = tab === 'Home' ? 'home' : tab === 'Translate' ? 'message-square' : 'book-open';
          return (
            <Pressable
              accessibilityLabel={`${tab} tab`}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              key={tab}
              onPress={() => handleTabPress(tab)}
              style={({ pressed }) => [styles.navItem, pressed && styles.pressed]}
              testID={`tab-${tab.toLowerCase()}`}
            >
              <Feather
                name={icon}
                size={19}
                color={isActive ? palette.primary : palette.mutedForeground}
              />
              <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>{tab}</Text>
              <View style={[styles.activeLine, !isActive && styles.inactiveLine]} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function createStyles(palette: typeof colors.light) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: palette.background,
    },
    safeArea: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: 22,
      paddingBottom: 28,
    },
    header: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingTop: Platform.OS === 'web' ? 20 : 10,
    },
    title: {
      color: palette.foreground,
      fontFamily: 'Inter_700Bold',
      fontSize: 22,
      letterSpacing: -0.5,
    },
    themeButton: {
      alignItems: 'center',
      backgroundColor: palette.card,
      borderColor: palette.border,
      borderRadius: 20,
      borderWidth: 1,
      height: 40,
      justifyContent: 'center',
      width: 40,
    },
    welcome: {
      alignItems: 'center',
      paddingBottom: 28,
      paddingTop: 52,
    },
    eyebrow: {
      color: palette.mutedForeground,
      fontFamily: 'Inter_600SemiBold',
      fontSize: 11,
      letterSpacing: 1.3,
      textTransform: 'uppercase',
    },
    tagline: {
      color: palette.foreground,
      fontFamily: 'Inter_600SemiBold',
      fontSize: 31,
      letterSpacing: -1.1,
      lineHeight: 37,
      marginTop: 12,
      textAlign: 'center',
    },
    welcomeCopy: {
      color: palette.mutedForeground,
      fontFamily: 'Inter_400Regular',
      fontSize: 14,
      lineHeight: 21,
      marginTop: 14,
      maxWidth: 260,
      textAlign: 'center',
    },
    translateCard: {
      backgroundColor: palette.card,
      borderColor: palette.border,
      borderRadius: palette === colors.dark ? 24 : 22,
      borderWidth: 1,
      elevation: 3,
      minHeight: 198,
      padding: 22,
      shadowColor: palette.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.08,
      shadowRadius: 17,
    },
    translateTop: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 28,
    },
    translateIcon: {
      alignItems: 'center',
      backgroundColor: palette.accent,
      borderRadius: 15,
      height: 43,
      justifyContent: 'center',
      width: 43,
    },
    cardTitle: {
      color: palette.cardForeground,
      fontFamily: 'Inter_700Bold',
      fontSize: 23,
      letterSpacing: -0.6,
    },
    cardSubtitle: {
      color: palette.mutedForeground,
      fontFamily: 'Inter_400Regular',
      fontSize: 14,
      lineHeight: 20,
      marginTop: 6,
    },
    goRow: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 6,
      marginTop: 26,
    },
    goText: {
      color: palette.primary,
      fontFamily: 'Inter_700Bold',
      fontSize: 15,
    },
    sectionHeader: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 14,
      marginTop: 34,
    },
    sectionTitle: {
      color: palette.foreground,
      fontFamily: 'Inter_700Bold',
      fontSize: 17,
      letterSpacing: -0.2,
    },
    recentRow: {
      flexDirection: 'row',
      gap: 14,
    },
    recentCard: {
      alignItems: 'center',
      backgroundColor: palette.card,
      borderColor: palette.border,
      borderRadius: 22,
      borderWidth: 1,
      flex: 1,
      minHeight: 155,
      paddingHorizontal: 12,
      paddingTop: 16,
    },
    recentCardActive: {
      backgroundColor: palette.accent,
      borderColor: palette.primary,
    },
    phraseIcon: {
      alignItems: 'center',
      backgroundColor: palette.secondary,
      borderRadius: 25,
      height: 48,
      justifyContent: 'center',
      width: 48,
    },
    phraseIconActive: {
      backgroundColor: palette.primary,
    },
    phraseLabel: {
      color: palette.cardForeground,
      fontFamily: 'Inter_600SemiBold',
      fontSize: 15,
      marginTop: 11,
    },
    playButton: {
      alignItems: 'center',
      backgroundColor: palette.primary,
      borderRadius: 17,
      height: 32,
      justifyContent: 'center',
      marginTop: 13,
      width: 32,
    },
    playButtonActive: {
      backgroundColor: palette.card,
    },
    playingLabel: {
      color: palette.primary,
      fontFamily: 'Inter_500Medium',
      fontSize: 10,
      marginTop: 5,
    },
    tip: {
      alignItems: 'center',
      backgroundColor: palette.secondary,
      borderRadius: 18,
      flexDirection: 'row',
      marginTop: 26,
      padding: 14,
    },
    tipIcon: {
      alignItems: 'center',
      backgroundColor: palette.card,
      borderRadius: 15,
      height: 30,
      justifyContent: 'center',
      width: 30,
    },
    tipCopy: {
      flex: 1,
      marginLeft: 11,
    },
    tipTitle: {
      color: palette.foreground,
      fontFamily: 'Inter_600SemiBold',
      fontSize: 13,
    },
    tipText: {
      color: palette.mutedForeground,
      fontFamily: 'Inter_400Regular',
      fontSize: 12,
      marginTop: 2,
    },
    bottomBar: {
      alignItems: 'flex-start',
      backgroundColor: palette.card,
      borderColor: palette.border,
      borderTopWidth: 1,
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingHorizontal: 14,
      paddingTop: 12,
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
    cardPressed: {
      opacity: 0.88,
      transform: [{ scale: 0.985 }],
    },
  });
}