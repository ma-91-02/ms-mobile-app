import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Pressable } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import useDirection from '../hooks/useDirection';
import AppColors from '../../constants/AppColors';
import {
  subscribeToAlerts,
  dismissAlert,
  type AlertState,
  type AlertButton,
} from '../utils/alert';

/**
 * عارض التنبيهات.
 *
 * يُركَّب مرّة واحدة في تخطيط الجذر ويستمع لمخزن `utils/alert`. سبب
 * وجوده أن `Alert.alert` من react-native لا تفعل شيئًا على الويب —
 * انظر التعليق في `utils/alert.ts`.
 */
export default function AlertHost() {
  const { isDarkMode } = useTheme();
  const appColors = isDarkMode ? AppColors.dark : AppColors.light;
  const { isRTL } = useDirection();
  const [state, setState] = useState<AlertState | null>(null);

  useEffect(() => subscribeToAlerts(setState), []);

  if (!state) return null;

  const press = (button: AlertButton) => {
    // تُغلق النافذة أولًا: بعض الأزرار تنتقل لشاشة أخرى، ولو بقيت
    // مفتوحة لغطّت الشاشة الجديدة
    dismissAlert();
    button.onPress?.();
  };

  const align = { textAlign: (isRTL ? 'right' : 'left') as 'right' | 'left' };
  const hasCancel = state.buttons.some((b) => b.style === 'cancel');

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      // زر الرجوع على أندرويد يغلق النافذة بدل الخروج من الشاشة
      onRequestClose={() => (hasCancel ? dismissAlert() : undefined)}
    >
      <Pressable
        style={styles.backdrop}
        onPress={() => (hasCancel ? dismissAlert() : undefined)}
      >
        {/* الضغط داخل الصندوق لا يُغلقه */}
        <Pressable
          style={[styles.box, { backgroundColor: appColors.background }]}
          onPress={() => {}}
        >
          <Text style={[styles.title, { color: appColors.text }, align]}>{state.title}</Text>

          {!!state.message && (
            <Text style={[styles.message, { color: appColors.textSecondary }, align]}>
              {state.message}
            </Text>
          )}

          <View
            style={[
              styles.actions,
              // ثلاثة أزرار أو أكثر تُرصّ عموديًا فلا تُقصّ نصوصها
              state.buttons.length > 2 ? styles.actionsStacked : null,
            ]}
          >
            {state.buttons.map((button, index) => (
              <TouchableOpacity
                key={`${button.text}-${index}`}
                style={[
                  styles.button,
                  state.buttons.length > 2 ? styles.buttonFull : null,
                  button.style === 'destructive'
                    ? styles.buttonDestructive
                    : button.style === 'cancel'
                    ? { backgroundColor: appColors.secondary }
                    : { backgroundColor: appColors.primary },
                ]}
                onPress={() => press(button)}
              >
                <Text
                  style={[
                    styles.buttonText,
                    button.style === 'cancel' ? { color: appColors.text } : null,
                  ]}
                >
                  {button.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  box: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 16,
    padding: 22,
  },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  message: { fontSize: 15, lineHeight: 23, marginBottom: 18 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  actionsStacked: { flexDirection: 'column' },
  button: {
    minWidth: 92,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonFull: { width: '100%' },
  buttonDestructive: { backgroundColor: '#E8563F' },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
