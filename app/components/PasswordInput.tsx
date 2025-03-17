import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PasswordInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  placeholderTextColor?: string;
  textColor?: string;
  borderColor?: string;
  isRTL?: boolean;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  value,
  onChangeText,
  placeholder,
  placeholderTextColor = '#999',
  textColor = '#000',
  borderColor = '#ccc',
  isRTL = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={[
      styles.container,
      { borderColor },
      { flexDirection: isRTL ? 'row-reverse' : 'row' }
    ]}>
      <TextInput
        style={[
          styles.input,
          { color: textColor },
          { textAlign: isRTL ? 'right' : 'left' },
          { backgroundColor: 'transparent' }
        ]}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor}
        secureTextEntry={!showPassword}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="none"
        autoComplete="off"
        autoCorrect={false}
        textContentType="oneTimeCode"
        keyboardType="default"
        spellCheck={false}
        clearTextOnFocus={false}
        selectTextOnFocus={false}
      />
      <TouchableOpacity
        onPress={() => setShowPassword(!showPassword)}
        style={styles.iconButton}
      >
        <Ionicons
          name={showPassword ? 'eye-off' : 'eye'}
          size={24}
          color={placeholderTextColor}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    height: 50,
    paddingHorizontal: 12,
    marginBottom: 10,
    width: '100%',
    backgroundColor: 'transparent',
  },
  input: {
    flex: 1,
    height: '100%',
    paddingVertical: 0,
  },
  iconButton: {
    padding: 5,
  },
});

export default PasswordInput; 