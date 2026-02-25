import React from 'react';
import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NeighbourhoodScreen() {
  const { slug } = useLocalSearchParams();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F7F9F9' }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 20, fontWeight: '700', color: '#141E1E' }}>Neighbourhood</Text>
        {slug && <Text style={{ fontSize: 14, color: '#666', marginTop: 8 }}>Slug: {slug}</Text>}
      </View>
    </SafeAreaView>
  );
}
