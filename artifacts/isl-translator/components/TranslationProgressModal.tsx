import { Feather } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import colors from '@/constants/colors';
import { useAccessibility } from '@/context/AccessibilityContext';

type PhaseStatus = 'completed' | 'in-progress' | 'pending';
interface Props { visible: boolean; failed?: boolean; onRetry: () => void; onDismiss?: () => void; }
const phases: Array<{ label: string; status: PhaseStatus }> = [
  { label: 'Preparing translation', status: 'completed' },
  { label: 'Generating ISL video', status: 'in-progress' },
  { label: 'Saving video', status: 'pending' },
  { label: 'Translation ready', status: 'pending' },
];

export default function TranslationProgressModal({ visible, failed = false, onRetry, onDismiss }: Props) {
  const { reducedMotion, textScale } = useAccessibility();
  const pulse = useRef(0);
  useEffect(() => { if (!reducedMotion && visible) pulse.current += 1; }, [reducedMotion, visible]);
  return <Modal transparent animationType={reducedMotion ? 'none' : 'fade'} visible={visible} onRequestClose={onDismiss}>
    <View style={styles.backdrop}><View style={styles.card}>
      <Text style={[styles.title, { fontSize: 21 * textScale }]}>{failed ? 'Translation could not be completed' : 'Preparing your translation'}</Text>
      {failed ? <Text style={styles.message}>The generation service stopped before the video was ready.</Text> : phases.map((phase) => {
        const status = phase.status;
        return <View key={phase.label} style={styles.row}>
          {status === 'completed' ? <Feather name="check-circle" size={22} color="#2E7D68" /> : status === 'in-progress' ? <ActivityIndicator color={colors.light.primary} /> : <Feather name="circle" size={21} color={colors.light.mutedForeground} />}
          <Text style={[styles.label, { fontSize: 15 * textScale }]}>{phase.label}</Text>
        </View>;
      })}
      {failed ? <Pressable accessibilityRole="button" onPress={onRetry} style={styles.button}><Text style={styles.buttonText}>Retry</Text></Pressable> : null}
    </View></View>
  </Modal>;
}
const styles = StyleSheet.create({ backdrop: { alignItems: 'center', backgroundColor: 'rgba(15,23,42,0.48)', flex: 1, justifyContent: 'center', padding: 24 }, card: { backgroundColor: '#FFFDF8', borderRadius: 18, padding: 24, width: '100%' }, title: { color: '#17211D', fontFamily: 'Inter_700Bold', marginBottom: 20 }, message: { color: '#647067', fontFamily: 'Inter_400Regular', lineHeight: 21, marginBottom: 18 }, row: { alignItems: 'center', flexDirection: 'row', gap: 13, marginBottom: 17 }, label: { color: '#26332C', fontFamily: 'Inter_500Medium' }, button: { alignItems: 'center', backgroundColor: colors.light.primary, borderRadius: 12, padding: 13 }, buttonText: { color: colors.light.primaryForeground, fontFamily: 'Inter_700Bold' } });
