import React, { useState } from 'react';
import { View, TextInput as RNTextInput, Text, type TextInputProps as RNTextInputProps } from 'react-native';
import { colors } from '../../theme/colors';

interface TextInputProps extends RNTextInputProps {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  containerClassName?: string;
}

export function TextInput({
  label,
  error,
  icon,
  containerClassName = '',
  ...props
}: TextInputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View className={containerClassName}>
      {label && (
        <Text className="text-sm font-body-medium text-neutral-700 mb-1.5">
          {label}
        </Text>
      )}
      <View
        className={`flex-row items-center bg-white border rounded-md px-4 py-3 ${
          error
            ? 'border-error'
            : focused
            ? 'border-primary-600'
            : 'border-neutral-200'
        }`}
      >
        {icon && <View className="mr-3">{icon}</View>}
        <RNTextInput
          className="flex-1 text-base font-body text-neutral-900"
          placeholderTextColor={colors.neutral[400]}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        />
      </View>
      {error && (
        <Text className="text-xs text-error mt-1">{error}</Text>
      )}
    </View>
  );
}
