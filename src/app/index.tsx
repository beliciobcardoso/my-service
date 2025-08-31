// src/app/index.tsx
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { printData } from "../utils/printer";
import { getPrinterSettings, PrinterSettings } from "../utils/storage";
import { Button } from "../components/Button";

export default function HomeScreen() {
  const [name, setName] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [printerSettings, setPrinterSettings] =
    useState<PrinterSettings | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const loadPrinterSettings = async () => {
    try {
      const settings = await getPrinterSettings();
      setPrinterSettings(settings);
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadPrinterSettings();
    }, [])
  );

  const handleConfirmPrint = async () => {
    if (!name.trim() || !code.trim()) {
      Alert.alert(
        "Campos obrigatórios",
        "Por favor, preencha o nome e o código."
      );
      return;
    }

    // Recarregar configurações no momento da impressão para garantir que temos os dados mais recentes
    let currentSettings = printerSettings;
    if (!currentSettings) {
      console.log("Recarregando configurações da impressora...");
      try {
        currentSettings = await getPrinterSettings();
        setPrinterSettings(currentSettings);
      } catch (error) {
        console.error("Erro ao recarregar configurações:", error);
      }
    }

    if (!currentSettings) {
      Alert.alert(
        "Impressora não configurada",
        "Configure uma impressora antes de tentar imprimir.",
        [
          {
            text: "Cancelar",
            style: "cancel",
          },
          {
            text: "Configurar",
            onPress: () => router.push("./settings"),
          },
        ]
      );
      return;
    }

    setIsLoading(true);

    try {
      const printContent = `ETIQUETA DE IDENTIFICAÇÃO
========================
Nome: ${name.trim()}
Código: ${code.trim()}
------------------------
Data: ${new Date().toLocaleDateString()}
Hora: ${new Date().toLocaleTimeString()}
========================`;

      await printData(currentSettings, printContent);

      Alert.alert("Sucesso", "Etiqueta impressa com sucesso!", [
        {
          text: "OK",
          onPress: () => {
            setName("");
            setCode("");
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert(
        "Erro na impressão",
        error.message || "Falha ao imprimir a etiqueta."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToSettings = () => {
    router.push("./settings");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Impressão de Etiquetas</Text>
          <Text style={styles.subtitle}>
            {printerSettings
              ? `Impressora: ${printerSettings.ipAddress}:${printerSettings.port}`
              : "Nenhuma impressora configurada"}
          </Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nome *</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite o nome"
              value={name}
              onChangeText={setName}
              maxLength={50}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Código *</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite o código"
              value={code}
              onChangeText={setCode}
              maxLength={20}
            />
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title="Enviar"
              isLoading={isLoading}
              loadingText="Enviando..."
              onPress={handleConfirmPrint}
            />
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={navigateToSettings}
            >
              <Text style={styles.secondaryButtonText}>Configurações</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#7f8c8d",
    textAlign: "center",
  },
  formContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    elevation: 5,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderColor: "#e1e8ed",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: "#ffffff",
  },
  buttonContainer: {
    marginTop: 10,
  },
  button: {
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: "#6200EE",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#6200EE",
  },
  disabledButton: {
    backgroundColor: "#bdc3c7",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButtonText: {
    color: "#6200EE",
    fontSize: 16,
    fontWeight: "600",
  },
});
