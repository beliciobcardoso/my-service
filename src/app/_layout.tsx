import { Stack, router } from "expo-router";
import { TouchableOpacity, View, Text, Modal, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";

export default function RootLayout() {
  const [showMenu, setShowMenu] = useState(false);

  const MenuDropdown = () => (
    <Modal
      visible={showMenu}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowMenu(false)}
    >
      <TouchableOpacity
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.3)',
          justifyContent: 'flex-start',
          alignItems: 'flex-end',
          paddingTop: 80,
          paddingRight: 15,
        }}
        onPress={() => setShowMenu(false)}
      >
        <View
          style={{
            backgroundColor: 'white',
            borderRadius: 8,
            padding: 8,
            minWidth: 180,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5,
          }}
        >
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 12,
              borderRadius: 6,
            }}
            onPress={() => {
              setShowMenu(false);
              router.push('./printers');
            }}
          >
            <Ionicons name="print" size={20} color="#6200EE" />
            <Text style={{ marginLeft: 12, fontSize: 16, color: '#333' }}>
              Impressoras
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 12,
              borderRadius: 6,
            }}
            onPress={() => {
              setShowMenu(false);
              router.push('./history');
            }}
          >
            <Ionicons name="time" size={20} color="#6200EE" />
            <Text style={{ marginLeft: 12, fontSize: 16, color: '#333' }}>
              Histórico
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 12,
              borderRadius: 6,
            }}
            onPress={() => {
              setShowMenu(false);
              router.push('./history-settings');
            }}
          >
            <Ionicons name="settings" size={20} color="#6200EE" />
            <Text style={{ marginLeft: 12, fontSize: 16, color: '#333' }}>
              Config. Histórico
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#6200EE",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Impressão Express",
          headerRight: () => (
            <>
              <TouchableOpacity
                onPress={() => setShowMenu(true)}
                style={{ marginRight: 15 }}
              >
                <Ionicons name="ellipsis-vertical" size={26} color="#fff" />
              </TouchableOpacity>
              <MenuDropdown />
            </>
          ),
        }}
      />
      <Stack.Screen
        name="settings"
        options={{ title: "Configurações da Impressora" }}
      />
      <Stack.Screen
        name="printers"
        options={{
          title: "Impressoras Salvas",
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push("./settings")}
              style={{ marginRight: 10 }}
            >
              <Ionicons name="settings-outline" size={26} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="history"
        options={{ title: "Histórico de Impressões" }}
      />
      <Stack.Screen
        name="history-settings"
        options={{ title: "Configurações do Histórico" }}
      />
    </Stack>
  );
}
