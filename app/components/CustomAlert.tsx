import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import AppColors from '../../constants/AppColors';

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message?: string;
  showLoading?: boolean;
  buttons?: Array<{
    text: string;
    onPress: () => void;
    style?: 'default' | 'cancel' | 'destructive';
  }>;
  onClose?: () => void;
}

const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  showLoading = false,
  buttons = [],
  onClose,
}) => {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const appColors = isDarkMode ? AppColors.dark : AppColors.light;

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: appColors.card }]}>
          <Text style={[styles.title, { color: appColors.text }, { fontFamily: 'Cairo-Bold' }]}>
            {title}
          </Text>

          {message && (
            <Text
              style={[styles.message, { color: appColors.text }, { fontFamily: 'Cairo-Regular' }]}
            >
              {message}
            </Text>
          )}

          {showLoading && (
            <ActivityIndicator size="large" color={appColors.primary} style={styles.loader} />
          )}

          {buttons.length > 0 && (
            <View style={styles.buttonContainer}>
              {buttons.map((button, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.button,
                    button.style === 'destructive' && { backgroundColor: appColors.danger },
                    button.style === 'default' && { backgroundColor: appColors.primary },
                    button.style === 'cancel' && { backgroundColor: appColors.secondary },
                  ]}
                  onPress={button.onPress}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      { color: button.style === 'cancel' ? appColors.text : '#fff' },
                      { fontFamily: 'Cairo-Medium' },
                    ]}
                  >
                    {button.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 5,
    marginHorizontal: 5,
    minWidth: 80,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  container: {
    alignItems: 'center',
    borderRadius: 14,
    padding: 20,
    width: '80%',
  },
  loader: {
    marginVertical: 20,
  },
  message: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  overlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
});

export default CustomAlert;
