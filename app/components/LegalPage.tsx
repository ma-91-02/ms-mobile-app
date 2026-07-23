import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import useDirection from '../hooks/useDirection';
import useResponsive from '../hooks/useResponsive';
import AppColors from '../../constants/AppColors';
import Logo from './Logo';

/**
 * هيكل مشترك للصفحات القانونية.
 *
 * النص نفسه يعيش في ملفات الترجمة لا هنا: صياغته تختلف بين اللغات ولا
 * تُترجَم حرفيًا، وتغييرها لا يجب أن يمسّ الكود.
 */

export interface LegalSection {
  heading: string;
  body: string;
}

interface Props {
  title: string;
  updatedAt: string;
  intro: string;
  sections: LegalSection[];
}

export default function LegalPage({ title, updatedAt, intro, sections }: Props) {
  const { isDarkMode } = useTheme();
  const appColors = isDarkMode ? AppColors.dark : AppColors.light;
  const { isRTL, backIcon } = useDirection();
  const { maxContentWidth, gutter } = useResponsive();

  const align = { textAlign: (isRTL ? 'right' : 'left') as 'right' | 'left' };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: appColors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingHorizontal: gutter,
            maxWidth: maxContentWidth,
            width: '100%',
            alignSelf: 'center',
          },
        ]}
      >
        <View style={[styles.header, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name={backIcon} size={24} color={appColors.text} />
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: isRTL ? 'flex-start' : 'flex-end' }}>
            <Logo height={28} />
          </View>
        </View>

        <Text style={[styles.title, { color: appColors.text }, align]}>{title}</Text>
        <Text style={[styles.updated, { color: appColors.textSecondary }, align]}>
          {updatedAt}
        </Text>

        <Text style={[styles.intro, { color: appColors.text }, align]}>{intro}</Text>

        {sections.map((section, index) => (
          <View key={section.heading} style={styles.section}>
            <Text style={[styles.heading, { color: appColors.text }, align]}>
              {index + 1}. {section.heading}
            </Text>
            <Text style={[styles.body, { color: appColors.textSecondary }, align]}>
              {section.body}
            </Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingVertical: 16, paddingBottom: 48 },
  header: { alignItems: 'center', gap: 14, marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  updated: { fontSize: 12, marginBottom: 18 },
  intro: { fontSize: 15, lineHeight: 24, marginBottom: 22 },
  section: { marginBottom: 20 },
  heading: { fontSize: 16, fontWeight: 'bold', marginBottom: 7 },
  body: { fontSize: 14, lineHeight: 23 },
});
