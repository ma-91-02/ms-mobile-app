import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Contact request status types
export type ContactRequestStatus = 'pending' | 'approved' | 'rejected' | null;

// Props for the ContactButton component
interface ContactButtonProps {
  status: ContactRequestStatus;
  isResolved: boolean;
  contactPhone?: string;
  onRequestContact: () => void;
  isLoading?: boolean;
  appColors: any;
}

// Define Ionicons name type
type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

/**
 * ContactButton - A component that displays a button to contact the owner of an advertisement
 * The button's appearance and behavior change based on the status of the contact request
 */
const ContactButton: React.FC<ContactButtonProps> = ({
  status,
  isResolved,
  contactPhone,
  onRequestContact,
  isLoading = false,
  appColors,
}) => {
  const { t } = useTranslation();
  const router = useRouter();

  // Get button configuration based on status
  const getButtonConfig = () => {
    if (isResolved) {
      return {
        text: t('adResolved', { ns: 'common' }) || 'تم استرجاع المستمسك',
        color: '#A0A0A0',
        icon: 'checkmark-circle' as IoniconsName,
        disabled: true,
        opacity: 0.7,
      };
    }

    switch (status) {
      case 'pending':
        return {
          text: t('contactRequestPending', { ns: 'common' }) || 'طلب التواصل قيد المراجعة',
          color: '#FFC95F',
          icon: 'time' as IoniconsName,
          disabled: false,
          opacity: 1,
        };
      case 'approved':
        return {
          text: t('viewContactInfo', { ns: 'common' }) || 'عرض معلومات التواصل',
          color: '#52BD94',
          icon: 'call' as IoniconsName,
          disabled: false,
          opacity: 1,
        };
      case 'rejected':
        return {
          text: t('contactRequestRejected', { ns: 'common' }) || 'تم رفض طلب التواصل',
          color: '#A0A0A0',
          icon: 'close-circle' as IoniconsName,
          disabled: true,
          opacity: 1,
        };
      default:
        return {
          text: t('contactOwner', { ns: 'common' }) || 'التواصل مع المالك',
          color: appColors.primary || '#614AE1',
          icon: 'mail' as IoniconsName,
          disabled: false,
          opacity: 1,
        };
    }
  };

  const handleButtonPress = () => {
    if (isLoading) return;

    // Different actions based on request status
    if (status === 'approved' && contactPhone) {
      // Display the owner's phone number
      Alert.alert(
        t('contactInformation', { ns: 'common' }) || 'معلومات التواصل',
        `${t('phoneNumber', { ns: 'common' }) || 'رقم الهاتف'}: ${contactPhone}`,
        [{ text: t('ok', { ns: 'common' }) || 'حسناً' }],
      );
    } else if (status === 'pending') {
      // Inform the user that their request is pending
      Alert.alert(
        t('contactRequestPending', { ns: 'common' }) || 'طلب التواصل قيد المراجعة',
        t('contactRequestPendingDesc', { ns: 'common' }) ||
          'طلب التواصل الخاص بك قيد المراجعة من قبل الإدارة. سيتم إعلامك عند الموافقة عليه.',
        [{ text: t('ok', { ns: 'common' }) || 'حسناً' }],
      );
    } else if (status === 'rejected') {
      // Inform the user that their request was rejected
      Alert.alert(
        t('contactRequestRejected', { ns: 'common' }) || 'تم رفض طلب التواصل',
        t('contactRequestRejectedDesc', { ns: 'common' }) ||
          'للأسف، تم رفض طلب التواصل الخاص بك. يرجى التواصل مع الإدارة لمزيد من المعلومات.',
        [{ text: t('ok', { ns: 'common' }) || 'حسناً' }],
      );
    } else {
      // Create a new contact request
      onRequestContact();
    }
  };

  const config = getButtonConfig();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: config.color,
          opacity: config.opacity,
        },
      ]}
      onPress={handleButtonPress}
      disabled={config.disabled || isLoading}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <>
          <Ionicons name={config.icon} size={22} color="#fff" />
          <Text style={styles.buttonText}>{config.text}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 12,
    elevation: 6,
    flexDirection: 'row',
    height: 56,
    justifyContent: 'center',
    marginVertical: 8,
    padding: 16,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default ContactButton;
