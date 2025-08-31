import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { printData } from "@/utils/printer";
import { getPrinterSettings, PrinterSettings } from "@/utils/storage";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { stylesHome } from "@/styles/styles";

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
      const printContent = `
            ENTREGADOR
      ========================
      Nome: ${name.trim()}
      Código: ${code.trim()}
      ------------------------
      Data: ${new Date().toLocaleDateString()}
      Hora: ${new Date().toLocaleTimeString()}
      ========================
`;

      await printData(currentSettings, printContent);

      Alert.alert("Sucesso", "Enviado com sucesso!", [
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
      style={stylesHome.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={stylesHome.scrollContent}>
        <View style={stylesHome.formContainer}>
          <View style={stylesHome.inputContainer}>
            <Text style={stylesHome.label}>Nome *</Text>
            <Input
              placeholder="Digite o nome"
              value={name}
              onChangeText={setName}
              maxLength={50}
            />
          </View>

          <View style={stylesHome.inputContainer}>
            <Text style={stylesHome.label}>Código *</Text>
            <Input
              placeholder="Digite o código"
              value={code}
              onChangeText={setCode}
              maxLength={20}
            />
          </View>

          <View style={stylesHome.buttonContainer}>
            <Button
              title="Enviar"
              isLoading={isLoading}
              loadingText="Enviando..."
              onPress={handleConfirmPrint}
            />
          </View>
        </View>
        <View style={stylesHome.footer}>
          <Text style={stylesHome.subtitle}>
            {printerSettings
              ? `Impressora: ${printerSettings.ipAddress}:${printerSettings.port}`
              : "Nenhuma impressora configurada"}
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
