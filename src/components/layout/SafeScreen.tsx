import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SafeScreenProps {
  children: React.ReactNode;
  className?: string;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}

export function SafeScreen({ children, className = '', edges }: SafeScreenProps) {
  return (
    <SafeAreaView
      edges={edges ?? ['top', 'left', 'right']}
      className={`flex-1 bg-neutral-50 ${className}`}
    >
      {children}
    </SafeAreaView>
  );
}
