import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import AppColors from '../../constants/AppColors';
import { RTL_LANGUAGES } from '../i18n/index';
import i18n, { changeLanguage } from '../i18n/index';
import { useTranslation } from 'react-i18next';

interface Language {
  code: string;
  name: string;
  localName: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'ar', name: 'arabic', localName: 'العربية', flag: '🇸🇦' },
  { code: 'en', name: 'english', localName: 'English', flag: '🇺🇸' },
  { code: 'ku', name: 'kurdish', localName: 'کوردی', flag: '🇮🇶' },
];

interface LanguageSelectorProps {
  isVisible: boolean;
  onClose: () => void;
  onLanguageChange: (language: string) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  isVisible,
  onClose,
  onLanguageChange,
}) => {
  const { isDarkMode } = useTheme();
  const appColors = isDarkMode ? AppColors.dark : AppColors.light;
  const { t } = useTranslation();
  const isRTL = RTL_LANGUAGES.includes(i18n.language);
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);

  const handleLanguageSelect = async (languageCode: string) => {
    setSelectedLanguage(languageCode);
    onLanguageChange(languageCode);
    onClose();
  };

  return (
    <Modal animationType="slide" transparent={true} visible={isVisible} onRequestClose={onClose}>
      <SafeAreaView style={styles.modalContainer}>
        <View style={[styles.modalContent, { backgroundColor: appColors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: appColors.text, fontFamily: 'Cairo-Bold' }]}>
              {t('selectLanguage', { ns: 'common' })}
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color={appColors.text} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={languages}
            keyExtractor={item => item.code}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.languageItem,
                  selectedLanguage === item.code && [
                    styles.selectedLanguageItem,
                    { backgroundColor: appColors.secondary },
                  ],
                  { flexDirection: isRTL ? 'row-reverse' : 'row' },
                ]}
                onPress={() => handleLanguageSelect(item.code)}
              >
                <Text style={styles.languageFlag}>{item.flag}</Text>
                <View style={styles.languageTextContainer}>
                  <Text
                    style={[
                      styles.languageName,
                      { color: appColors.text, fontFamily: 'Cairo-Medium' },
                      { textAlign: isRTL ? 'right' : 'left' },
                    ]}
                  >
                    {item.localName}
                  </Text>
                  <Text
                    style={[
                      styles.languageNativeName,
                      { color: appColors.textSecondary, fontFamily: 'Cairo-Regular' },
                      { textAlign: isRTL ? 'right' : 'left' },
                    ]}
                  >
                    {t(item.name, { ns: 'common' })}
                  </Text>
                </View>
                {selectedLanguage === item.code && (
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={appColors.primary}
                    style={styles.checkIcon}
                  />
                )}
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.languageList}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  checkIcon: {
    marginLeft: 8,
  },
  closeButton: {
    padding: 4,
    position: 'absolute',
    right: 16,
  },
  languageFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  languageItem: {
    alignItems: 'center',
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    flexDirection: 'row',
    padding: 16,
  },
  languageList: {
    paddingVertical: 8,
  },
  languageName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  languageNativeName: {
    fontSize: 14,
  },
  languageTextContainer: {
    flex: 1,
    marginLeft: 8,
  },
  modalContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flex: 1,
    justifyContent: 'center',
  },
  modalContent: {
    borderRadius: 16,
    elevation: 5,
    margin: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalHeader: {
    alignItems: 'center',
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 16,
    position: 'relative',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  selectedLanguageItem: {
    borderRadius: 8,
    margin: 4,
  },
});

export default LanguageSelector;
