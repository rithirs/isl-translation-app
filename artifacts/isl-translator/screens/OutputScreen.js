import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '@/constants/colors';

const DEFAULT_MESSAGE = 'Good morning';

export default function OutputScreen() {
  const insets = useSafeAreaInsets();
  const { message } = useLocalSearchParams();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const styles = useMemo(() => createStyles(colors.light), []);

  const rawMessage = Array.isArray(message) ? message[0] : message;
  const displayMessage = rawMessage?.trim() || DEFAULT_MESSAGE;
  const signWords = displayMessage
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 4)
    .map((word) => word.replace(/[^\p{L}\p{N}'-]/gu, '').toUpperCase())
    .filter(Boolean);

  const handlePlay = () => {
    setIsPlaying((current) => !current);
  };

  const handleReplay = () => {
    setIsPlaying(true);
    Alert.alert('Replay started', 'The ISL video preview is ready to play again.');
  };

  const handleSave = () => {
    setIsSaved((current) => !current);
  };

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingBottom: Math.max(insets.bottom, 24) },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <TouchableOpacity
              accessibilityLabel="Go back"
              accessibilityRole="button"
              onPress={() => router.back()}
              style={styles.backButton}
              testID="output-back"
            >
              <Feather name="arrow-left" size={21} color={colors.light.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>ISL Result</Text>
            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.messageSection}>
            <Text style={styles.messageLabel}>Your message</Text>
            <Text style={styles.messageText}>"{displayMessage}"</Text>
          </View>

          <TouchableOpacity
            accessibilityLabel={isPlaying ? 'Pause ISL video preview' : 'Play ISL video preview'}
            accessibilityRole="button"
            activeOpacity={0.9}
            onPress={handlePlay}
            style={styles.videoCard}
            testID="isl-video-preview"
          >
            <View style={[styles.playButton, isPlaying && styles.playButtonActive]}>
              <Feather
                name={isPlaying ? 'pause' : 'play'}
                size={26}
                color={colors.light.primaryForeground}
                style={isPlaying ? undefined : styles.playIcon}
              />
            </View>
            <View style={styles.videoLabel}>
              <Feather name="video" size={14} color="rgba(255,255,255,0.82)" />
              <Text style={styles.videoLabelText}>ISL Video Preview</Text>
            </View>
            {isPlaying ? <Text style={styles.playingText}>Playing preview</Text> : null}
          </TouchableOpacity>

          <View style={styles.statusRow}>
            <View style={styles.statusBadge}>
              <Feather name="check-circle" size={16} color={colors.light.success} />
              <Text style={styles.statusText}>ISL Translation Ready</Text>
            </View>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity
              accessibilityLabel={isSaved ? 'Remove from saved translations' : 'Save translation'}
              accessibilityRole="button"
              activeOpacity={0.78}
              onPress={handleSave}
              style={[styles.actionButton, isSaved && styles.actionButtonActive]}
              testID="save-result"
            >
              <Feather
                name="star"
                size={16}
                color={isSaved ? colors.light.primaryForeground : colors.light.primary}
              />
              <Text style={[styles.actionText, isSaved && styles.actionTextActive]}>
                {isSaved ? 'Saved' : 'Save'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityLabel="Replay ISL translation"
              accessibilityRole="button"
              activeOpacity={0.78}
              onPress={handleReplay}
              style={styles.actionButton}
              testID="replay-result"
            >
              <Feather name="rotate-ccw" size={16} color={colors.light.primary} />
              <Text style={styles.actionText}>Replay</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.sequenceHeader}>
            <Text style={styles.sequenceTitle}>Sign sequence</Text>
            <Text style={styles.sequenceCount}>{signWords.length} signs</Text>
          </View>

          <View style={styles.chipRow}>
            {signWords.map((word) => (
              <View key={word} style={styles.signChip}>
                <Text style={styles.signChipText}>[{word}]</Text>
              </View>
            ))}
          </View>
        </ScrollView>
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
    messageSection: {
      marginTop: 31,
    },
    messageLabel: {
      color: palette.mutedForeground,
      fontFamily: 'Inter_400Regular',
      fontSize: 13,
    },
    messageText: {
      color: palette.foreground,
      fontFamily: 'Inter_700Bold',
      fontSize: 18,
      letterSpacing: -0.2,
      marginTop: 7,
    },
    videoCard: {
      alignItems: 'center',
      aspectRatio: 16 / 9,
      backgroundColor: '#1E293B',
      borderRadius: 20,
      justifyContent: 'center',
      marginTop: 20,
      overflow: 'hidden',
      position: 'relative',
      width: '100%',
    },
    playButton: {
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.16)',
      borderColor: 'rgba(255,255,255,0.32)',
      borderRadius: 34,
      borderWidth: 1,
      height: 68,
      justifyContent: 'center',
      width: 68,
    },
    playButtonActive: {
      backgroundColor: 'rgba(255,255,255,0.24)',
    },
    playIcon: {
      marginLeft: 3,
    },
    videoLabel: {
      alignItems: 'center',
      bottom: 14,
      flexDirection: 'row',
      gap: 7,
      left: 16,
      position: 'absolute',
    },
    videoLabelText: {
      color: 'rgba(255,255,255,0.82)',
      fontFamily: 'Inter_500Medium',
      fontSize: 12,
    },
    playingText: {
      color: 'rgba(255,255,255,0.72)',
      fontFamily: 'Inter_500Medium',
      fontSize: 11,
      marginTop: 11,
    },
    statusRow: {
      alignItems: 'flex-start',
      marginTop: 17,
    },
    statusBadge: {
      alignItems: 'center',
      backgroundColor: palette.successSoft,
      borderRadius: 17,
      flexDirection: 'row',
      gap: 7,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    statusText: {
      color: palette.success,
      fontFamily: 'Inter_600SemiBold',
      fontSize: 12,
    },
    actionRow: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 15,
    },
    actionButton: {
      alignItems: 'center',
      borderColor: palette.primary,
      borderRadius: 20,
      borderWidth: 1,
      flexDirection: 'row',
      gap: 7,
      justifyContent: 'center',
      minHeight: 40,
      paddingHorizontal: 15,
    },
    actionButtonActive: {
      backgroundColor: palette.primary,
    },
    actionText: {
      color: palette.primary,
      fontFamily: 'Inter_600SemiBold',
      fontSize: 13,
    },
    actionTextActive: {
      color: palette.primaryForeground,
    },
    sequenceHeader: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 35,
    },
    sequenceTitle: {
      color: palette.foreground,
      fontFamily: 'Inter_700Bold',
      fontSize: 14,
    },
    sequenceCount: {
      color: palette.mutedForeground,
      fontFamily: 'Inter_400Regular',
      fontSize: 12,
    },
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      marginTop: 14,
    },
    signChip: {
      backgroundColor: palette.card,
      borderColor: palette.primary,
      borderRadius: 16,
      borderWidth: 1,
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    signChipText: {
      color: palette.primary,
      fontFamily: 'Inter_700Bold',
      fontSize: 13,
      letterSpacing: 0.4,
    },
  });
}