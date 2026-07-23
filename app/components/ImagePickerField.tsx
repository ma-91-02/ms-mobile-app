import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../context/ThemeContext';
import i18n, { RTL_LANGUAGES } from '../i18n';
import useDirection from '../hooks/useDirection';
import AppColors from '../../constants/AppColors';
import { showAlert } from '../utils/alert';

/**
 * اختيار صور الإعلان.
 *
 * صورة المستمسك أقوى دليل بصري على صدق الإعلان، وكان النموذج بلا أي
 * وسيلة لإرفاقها رغم أن الخادم يقبل حتى خمس صور.
 *
 * `expo-image-picker` يعمل على المنصات الثلاث: على الويب يفتح حوار
 * الملفات، وعلى الجوال معرض الصور — فيبقى الكود صالحًا للنسخة الأصلية.
 */

export interface PickedImage {
  uri: string;
  name: string;
  type: string;
}

interface Props {
  images: PickedImage[];
  onChange: (images: PickedImage[]) => void;
  max?: number;
}

export default function ImagePickerField({ images, onChange, max = 5 }: Props) {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const appColors = isDarkMode ? AppColors.dark : AppColors.light;
  const { isRTL } = useDirection();

  const pick = async () => {
    if (images.length >= max) {
      showAlert(t('alert'), t('maxImagesReached', { count: max }));
      return;
    }

    // الإذن مطلوب على الجوال فقط؛ الويب يفتح حوار الملفات بلا إذن مسبق
    if (Platform.OS !== 'web') {
      const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!granted) {
        showAlert(t('alert'), t('galleryPermissionDenied'));
        return;
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: max - images.length,
      // ضغط قبل الرفع: صور الهواتف الحديثة تتجاوز حدّ الخادم (5 ميجابايت)
      quality: 0.7,
    });

    if (result.canceled) return;

    const picked: PickedImage[] = result.assets.map((asset, index) => ({
      uri: asset.uri,
      name: asset.fileName || `image-${Date.now()}-${index}.jpg`,
      type: asset.mimeType || 'image/jpeg',
    }));

    onChange([...images, ...picked].slice(0, max));
  };

  const remove = (uri: string) => onChange(images.filter((img) => img.uri !== uri));

  return (
    <View style={styles.wrapper}>
      <View style={[styles.grid, { flexDirection: 'row' }]}>
        {images.map((img) => (
          <View key={img.uri} style={styles.thumbWrapper}>
            <Image source={{ uri: img.uri }} style={styles.thumb} />
            <TouchableOpacity
              style={[styles.removeBadge, isRTL ? { left: -6 } : { right: -6 }]}
              onPress={() => remove(img.uri)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close" size={14} color="#fff" />
            </TouchableOpacity>
          </View>
        ))}

        {images.length < max && (
          <TouchableOpacity
            style={[styles.addBox, { borderColor: appColors.primary, backgroundColor: appColors.secondary }]}
            onPress={pick}
          >
            <Ionicons name="camera-outline" size={26} color={appColors.primary} />
            <Text style={[styles.addText, { color: appColors.primary }]}>
              {t('addPhoto')}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <Text
        style={[
          styles.hint,
          { color: appColors.textSecondary, textAlign: isRTL ? 'right' : 'left' },
        ]}
      >
        {t('imagesHint', { count: max })}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 8 },
  grid: { flexWrap: 'wrap', gap: 10 },
  thumbWrapper: { position: 'relative' },
  thumb: { width: 84, height: 84, borderRadius: 10 },
  removeBadge: {
    position: 'absolute',
    top: -6,
    backgroundColor: '#E8563F',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBox: {
    width: 84,
    height: 84,
    borderRadius: 10,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  addText: { fontSize: 11, fontWeight: '600' },
  hint: { fontSize: 12, lineHeight: 17 },
});
