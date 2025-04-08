import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

interface ContactRequestModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => Promise<void>;
  isLoading: boolean;
  appColors: any;
}

/**
 * Modal for submitting contact requests
 * Includes input validation and loading state
 */
const ContactRequestModal: React.FC<ContactRequestModalProps> = ({
  visible,
  onClose,
  onSubmit,
  isLoading,
  appColors,
}) => {
  const { t } = useTranslation();
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  // Validate input and submit
  const handleSubmit = async () => {
    if (!reason || reason.trim().length < 3) {
      setError(
        t('contactReasonRequired', { ns: 'common' }) || 'يرجى إدخال سبب التواصل (3 أحرف على الأقل)',
      );
      return;
    }

    setError('');

    try {
      await onSubmit(reason);
      // Reset form on successful submission
      setReason('');
    } catch (err) {
      console.error('Error in contact request submission:', err);
    }
  };

  // Close modal and reset form
  const handleClose = () => {
    setReason('');
    setError('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: appColors.card }]}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: appColors.text }]}>
              {t('contactReason', { ns: 'common' }) || 'سبب التواصل'}
            </Text>
            {!isLoading && (
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={appColors.text} />
              </TouchableOpacity>
            )}
          </View>

          {/* Contact reason input */}
          <Text style={[styles.modalDescription, { color: appColors.textSecondary }]}>
            {t('contactReasonDesc', { ns: 'common' }) || 'يرجى إدخال سبب التواصل مع صاحب الإعلان'}
          </Text>

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: appColors.input,
                color: appColors.text,
                borderColor: error ? appColors.danger : appColors.border,
              },
            ]}
            placeholder={t('enterContactReason', { ns: 'common' }) || 'أدخل سبب التواصل هنا...'}
            placeholderTextColor={appColors.textSecondary}
            value={reason}
            onChangeText={text => {
              setReason(text);
              if (text.trim().length >= 3) {
                setError('');
              }
            }}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            editable={!isLoading}
          />

          {/* Error message if validation fails */}
          {error ? (
            <Text style={[styles.errorText, { color: appColors.danger }]}>{error}</Text>
          ) : null}

          {/* Action buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.submitButton,
                {
                  backgroundColor: appColors.primary,
                  opacity: isLoading ? 0.7 : 1,
                },
              ]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {t('submit', { ns: 'common' }) || 'إرسال'}
                </Text>
              )}
            </TouchableOpacity>

            {!isLoading && (
              <TouchableOpacity
                style={[styles.cancelButton, { borderColor: appColors.border }]}
                onPress={handleClose}
              >
                <Text style={[styles.cancelButtonText, { color: appColors.text }]}>
                  {t('cancel', { ns: 'common' }) || 'إلغاء'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    gap: 12,
    marginTop: 16,
  },
  cancelButton: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    padding: 14,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  closeButton: {
    padding: 4,
  },
  errorText: {
    fontSize: 14,
    marginBottom: 16,
  },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    marginBottom: 8,
    minHeight: 120,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  modalContainer: {
    borderRadius: 12,
    elevation: 5,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    width: '100%',
  },
  modalDescription: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 16,
  },
  modalHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  submitButton: {
    alignItems: 'center',
    borderRadius: 8,
    justifyContent: 'center',
    padding: 14,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ContactRequestModal;
