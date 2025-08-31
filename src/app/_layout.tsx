import { Stack } from 'expo-router';

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
      <Stack.Screen name="index" options={{ title: 'Impressão de Etiquetas' }} />
      <Stack.Screen name="settings" options={{ title: 'Configurações da Impressora' }} />
    </Stack>
  );
}
