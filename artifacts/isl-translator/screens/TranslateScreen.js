import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '@/constants/colors';

const MAX_CHARACTERS = 500;

const recentSearches = ['Good morning', 'Thank you'];

export default function TranslateScreen() {
  const insets = useSafeAreaInsets();
  const [text, setText] = useState('');
  const styles = useMemo(() => createStyles(colors.light), []);

  const handleTranslate = () => {
    if (!text.trim()) {
      Alert.alert('Add a message', 'Type something in English or Tamil to translate.');
      return;
    }

    router.push({
      pathname: '/output',
      params: { message: text.trim() },
    });
  };

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <KeyboardAwareScrollViewCompat
          bottomOffset={24}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: Math.max(insets.bottom, 24) },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <TouchableOpacity
              accessibilityLabel="Go back"
              accessibilityRole="button"
              onPress={() => router.back()}
              style={styles.backButton}
              testID="translate-back"
            >
              <Feather name="arrow-left" size={21} color={colors.light.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Translate</Text>
            <View style={styles.headerSpacer} />
          </View>

          <Text style={styles.subtitle}>Translate into ISL</Text>

          <View style={styles.inputCard}>
            <View style={styles.cardHeader}>
              <View style={styles.languagePill}>
                <Feather name="globe" size={14} color={colors.light.primary} />
                <Text style={styles.languageText}>English / Tamil</Text>
              </View>
              <Feather name="edit-3" size={17} color={colors.light.mutedForeground} />
            </View>

            <TextInput
              accessibilityLabel="Message to translate"
              autoCapitalize="sentences"
              blurOnSubmit={false}
              multiline
              onChangeText={setText}
              placeholder="Type your message here..."
              placeholderTextColor="#94A3B8"
              style={styles.textInput}
              textAlignVertical="top"
              value={text}
              maxLength={MAX_CHARACTERS}
              testID="translation-input"
            />

            <Text style={styles.counter}>
              {text.length} / {MAX_CHARACTERS}
            </Text>
          </View>

          <TouchableOpacity
            accessibilityLabel="Translate message"
            accessibilityRole="button"
            activeOpacity={0.82}
            onPress={handleTranslate}
            style={styles.translateButton}
            testID="translate-submit"
          >
            <Text style={styles.translateButtonText}>TRANSLATE</Text>
            <Feather name="arrow-right" size={18} color={colors.light.primaryForeground} />
          </TouchableOpacity>

          <View style={styles.recentHeader}>
            <Text style={styles.recentTitle}>Recent</Text>
            <Feather name="clock" size={16} color={colors.light.mutedForeground} />
          </View>

          <View style={styles.recentList}>
            {recentSearches.map((search) => (
              <TouchableOpacity
                accessibilityLabel={`Use recent phrase ${search}`}
                accessibilityRole="button"
                activeOpacity={0.75}
                key={search}
                onPress={() => setText(search)}
                style={styles.recentRow}
              >
                <View style={styles.recentIcon}>
                  <Feather name="rotate-ccw" size={15} color={colors.light.primary} />
                </View>
                <Text style={styles.recentText}>{search}</Text>
                <Feather name="arrow-up-left" size={16} color={colors.light.mutedForeground} />
              </TouchableOpacity>
            ))}
          </View>
        </KeyboardAwareScrollViewCompat>
      </SafeAreaView>
    </View>
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
    backButton: {
      alignItems: 'center',
      backgroundColor: palette.card,
      borderColor: palette.border,
      borderRadius: 20,
      borderWidth: 1,
      height: 40,
      justifyContent: 'center',
      width: 40,
    },
    headerSpacer: {
      width: 40,
    },
    headerTitle: {
      color: palette.foreground,
      fontFamily: 'Inter_700Bold',
      fontSize: 20,
      letterSpacing: -0.35,
    },
    subtitle: {
      color: palette.mutedForeground,
      fontFamily: 'Inter_400Regular',
      fontSize: 16,
      marginTop: 32,
    },
    inputCard: {
      backgroundColor: palette.card,
      borderColor: palette.border,
      borderRadius: 18,
      borderWidth: 1,
      elevation: 3,
      marginTop: 14,
      minHeight: 224,
      padding: 18,
      shadowColor: palette.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.08,
      shadowRadius: 18,
    },
    cardHeader: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    languagePill: {
      alignItems: 'center',
      backgroundColor: palette.accent,
      borderRadius: 18,
      flexDirection: 'row',
      gap: 7,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    languageText: {
      color: palette.primary,
      fontFamily: 'Inter_600SemiBold',
      fontSize: 12,
    },
    textInput: {
      color: palette.foreground,
      fontFamily: 'Inter_400Regular',
      fontSize: 16,
      height: 140,
      lineHeight: 23,
      paddingHorizontal: 0,
      paddingVertical: 16,
    },
    counter: {
      alignSelf: 'flex-end',
      color: palette.mutedForeground,
      fontFamily: 'Inter_400Regular',
      fontSize: 12,
      marginTop: 3,
    },
    translateButton: {
      alignItems: 'center',
      backgroundColor: palette.primary,
      borderRadius: 25,
      flexDirection: 'row',
      gap: 10,
      justifyContent: 'center',
      marginTop: 20,
      minHeight: 52,
      paddingHorizontal: 20,
    },
    translateButtonText: {
      color: palette.primaryForeground,
      fontFamily: 'Inter_700Bold',
      fontSize: 16,
      letterSpacing: 1,
    },
    recentHeader: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 13,
      marginTop: 34,
    },
    recentTitle: {
      color: palette.foreground,
      fontFamily: 'Inter_700Bold',
      fontSize: 15,
    },
    recentList: {
      gap: 10,
    },
    recentRow: {
      alignItems: 'center',
      backgroundColor: palette.card,
      borderColor: palette.border,
      borderRadius: 18,
      borderWidth: 1,
      flexDirection: 'row',
      minHeight: 56,
      paddingHorizontal: 13,
    },
    recentIcon: {
      alignItems: 'center',
      backgroundColor: palette.secondary,
      borderRadius: 15,
      height: 30,
      justifyContent: 'center',
      width: 30,
    },
    recentText: {
      color: palette.cardForeground,
      flex: 1,
      fontFamily: 'Inter_500Medium',
      fontSize: 14,
      marginLeft: 11,
    },
  });
}