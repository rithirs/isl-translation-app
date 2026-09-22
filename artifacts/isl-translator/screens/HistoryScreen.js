import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo } from 'react';
import {
  Platform,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '@/constants/colors';

const historySections = [
  {
    title: 'Today',
    data: ['Good morning', 'Can you help me?', 'Thank you'],
  },
  {
    title: 'Yesterday',
    data: ['Where is the library?'],
  },
];

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors.light), []);

  const handleItemPress = (message) => {
    router.push({
      pathname: '/output',
      params: { message },
    });
  };

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <SectionList
          contentContainerStyle={[
            styles.content,
            { paddingBottom: Math.max(insets.bottom, 24) },
          ]}
          keyExtractor={(item, index) => `${item}-${index}`}
          ListHeaderComponent={
            <View style={styles.header}>
              <Text style={styles.title}>History</Text>
              <Text style={styles.subtitle}>Previous translations and saved videos</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              accessibilityLabel={`Open ${item} translation`}
              accessibilityRole="button"
              activeOpacity={0.8}
              onPress={() => handleItemPress(item)}
              style={styles.historyItem}
              testID={`history-${item.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
            >
              <View style={styles.itemCopy}>
                <View style={styles.itemDot} />
                <Text style={styles.itemText}>{item}</Text>
              </View>
              <View style={styles.playButton}>
                <Feather name="play" size={14} color={colors.light.primaryForeground} />
              </View>
            </TouchableOpacity>
          )}
          renderSectionHeader={({ section: { title } }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{title}</Text>
              <View style={styles.sectionLine} />
            </View>
          )}
          sections={historySections}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
        />
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
      marginBottom: 4,
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
    sectionHeader: {
      alignItems: 'center',
      flexDirection: 'row',
      marginBottom: 13,
      marginTop: 28,
    },
    sectionTitle: {
      color: palette.foreground,
      fontFamily: 'Inter_700Bold',
      fontSize: 15,
    },
    sectionLine: {
      backgroundColor: palette.border,
      flex: 1,
      height: 1,
      marginLeft: 14,
    },
    historyItem: {
      alignItems: 'center',
      backgroundColor: palette.card,
      borderColor: palette.border,
      borderRadius: 16,
      borderWidth: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 10,
      minHeight: 66,
      paddingHorizontal: 14,
      paddingVertical: 11,
    },
    itemCopy: {
      alignItems: 'center',
      flex: 1,
      flexDirection: 'row',
    },
    itemDot: {
      backgroundColor: palette.accent,
      borderRadius: 16,
      height: 32,
      marginRight: 12,
      width: 32,
    },
    itemText: {
      color: palette.cardForeground,
      flex: 1,
      fontFamily: 'Inter_600SemiBold',
      fontSize: 15,
    },
    playButton: {
      alignItems: 'center',
      backgroundColor: palette.primary,
      borderRadius: 18,
      height: 36,
      justifyContent: 'center',
      width: 36,
    },
  });
}