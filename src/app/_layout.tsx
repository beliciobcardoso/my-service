import { Stack, router } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#6200EE',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Impressão de Etiquetas',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push('./settings')}
              style={{ marginRight: 10 }}
            >
              <Ionicons name="settings-outline" size={30} color="#fff" />
            </TouchableOpacity>
          ),
        }} 
      />
      <Stack.Screen name="settings" options={{ title: 'Configurações da Impressora' }} />
    </Stack>
  );
}
