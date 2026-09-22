import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export type StatusToastKind = 'empty' | 'too_long' | 'network' | 'generation' | 'video';
const messages: Record<StatusToastKind, string> = {
  empty: 'Please enter text to translate.',
  too_long: 'Please shorten your message (max 500 characters).',
  network: 'Unable to connect. Please check your internet connection.',
  generation: "We couldn't generate the ISL video. Please try again.",
  video: 'The sign video is temporarily unavailable.',
};

export function StatusToast({ kind, onDismiss }: { kind: StatusToastKind; onDismiss?: () => void }) {
  return <View accessibilityLiveRegion="polite" accessibilityRole="alert" style={styles.container}>
    <Feather name="alert-circle" size={18} color="#FFFFFF" />
    <Text style={styles.message}>{messages[kind]}</Text>
    {onDismiss ? <Pressable accessibilityLabel="Dismiss message" onPress={onDismiss}><Feather name="x" size={18} color="#FFFFFF" /></Pressable> : null}
  </View>;
}

export function classifyApiError(error: unknown): StatusToastKind {
  const message = error instanceof Error ? error.message.toLowerCase() : '';
  if (message.includes('500') || message.includes('connect') || message.includes('network')) return 'network';
  if (message.includes('video') || message.includes('asset')) return 'video';
  return 'generation';
}

const styles = StyleSheet.create({ container: { alignItems: 'center', backgroundColor: '#A73A3A', borderRadius: 12, flexDirection: 'row', gap: 10, marginHorizontal: 20, padding: 13 }, message: { color: '#FFF', flex: 1, fontFamily: 'Inter_500Medium', fontSize: 14 } });
