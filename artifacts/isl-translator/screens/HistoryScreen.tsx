import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, SectionList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '@/constants/colors';
import { api, type HistoryItem } from '@/lib/api';
import { useAccessibility } from '@/context/AccessibilityContext';

function groupDate(value: string): string { const date = new Date(value); const today = new Date(); const yesterday = new Date(); yesterday.setDate(today.getDate() - 1); if (date.toDateString() === today.toDateString()) return 'Today'; if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'; return date.toLocaleDateString(); }
export default function HistoryScreen() {
  const [items, setItems] = useState<HistoryItem[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null); const { highContrast, textScale } = useAccessibility();
  useEffect(() => { api.history().then(setItems).catch((e: Error) => setError(e.message)).finally(() => setLoading(false)); }, []);
  const sections = Object.entries(items.reduce<Record<string, HistoryItem[]>>((groups, item) => { const key = groupDate(item.viewed_at); (groups[key] ??= []).push(item); return groups; }, {})).map(([title, data]) => ({ title, data }));
  return <SafeAreaView style={[styles.screen, highContrast && styles.contrast]}><SectionList sections={sections} keyExtractor={(item) => item.id} contentContainerStyle={styles.content} ListHeaderComponent={<Text style={[styles.title, { fontSize: 25 * textScale }]}>History</Text>} ListEmptyComponent={loading ? <ActivityIndicator /> : <Text style={styles.muted}>{error ?? 'No translations viewed yet.'}</Text>} renderSectionHeader={({ section }) => <Text style={styles.section}>{section.title}</Text>} renderItem={({ item }) => <Pressable style={styles.item} onPress={() => { const t = item.translation; if (!t) return; router.push({ pathname: '/output', params: { message: t.input_text, videoUrl: item.videoUrl, signSequence: JSON.stringify(t.sign_sequence) } }); }}><View style={styles.copy}><Feather name="clock" size={18} color={colors.light.primary} /><Text style={styles.itemText}>{item.translation?.input_text ?? 'Translation'}</Text></View><Feather name="play-circle" size={23} color={colors.light.primary} /></Pressable>} /></SafeAreaView>;
}
const styles = StyleSheet.create({ screen: { backgroundColor: colors.light.background, flex: 1 }, contrast: { backgroundColor: '#000' }, content: { padding: 22 }, title: { color: colors.light.foreground, fontFamily: 'Inter_700Bold', marginBottom: 18 }, section: { color: colors.light.foreground, fontFamily: 'Inter_700Bold', marginBottom: 9, marginTop: 16 }, item: { alignItems: 'center', backgroundColor: colors.light.card, borderColor: colors.light.border, borderRadius: 14, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 9, padding: 16 }, copy: { alignItems: 'center', flex: 1, flexDirection: 'row', gap: 12 }, itemText: { color: colors.light.cardForeground, flex: 1, fontFamily: 'Inter_600SemiBold' }, muted: { color: colors.light.mutedForeground, fontFamily: 'Inter_400Regular' } });
