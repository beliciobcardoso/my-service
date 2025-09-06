import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { printData } from "@/utils/printer";
import {
  getPrinterSettings,
  PrinterSettings,
  getSavedPrinters,
  getDefaultPrinter,
  SavedPrinter,
} from "@/utils/storage";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { stylesHome } from "@/styles/styles";

export default function HomeScreen() {
  const [name, setName] = useState<string>("");
  const [codes, setCodes] = useState<string[]>([""]);
  const [printerSettings, setPrinterSettings] =
    useState<PrinterSettings | null>(null);
  const [savedPrinters, setSavedPrinters] = useState<SavedPrinter[]>([]);
  const [selectedPrinter, setSelectedPrinter] = useState<SavedPrinter | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const loadPrinterSettings = async () => {
    try {
      // Carregar configurações atuais
      const settings = await getPrinterSettings();
      setPrinterSettings(settings);

      // Carregar impressoras salvas
      const cached = await getSavedPrinters();
      setSavedPrinters(cached);

      // Definir impressora padrão se existir
      const defaultPrinter = await getDefaultPrinter();
      setSelectedPrinter(defaultPrinter);
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
    if (!name.trim() || codes.some((c) => !c.trim())) {
      Alert.alert(
        "Campos obrigatórios",
        "Por favor, preencha o nome e todos os códigos."
      );
      return;
    }

    // Verificar se existe impressora selecionada ou configuração atual
    let currentSettings = selectedPrinter || printerSettings;
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
  Pedidos:\n${codes.map((c, i) => `  ${i + 1}: ${c.trim()}`).join("\n")}
  ------------------------
  Data: ${new Date().toLocaleDateString()}
  Hora: ${new Date().toLocaleTimeString()}
  ========================
`;

      // Definir nome da impressora (usar o nome salvo ou gerar um baseado no IP)
      const printerName =
        selectedPrinter?.name || `Impressora ${currentSettings.ipAddress}`;
      const printerId = selectedPrinter?.id;

      const result = await printData(
        printContent,
        currentSettings,
        printerId,
        printerName,
        { nome: name.trim(), codigo: codes.map((c) => c.trim()).join(", ") }
      );

      console.log("Resultado da impressão:", result);

      Alert.alert(
        result.success ? "Sucesso" : `Erro: ${result.message}`,
        result.details,
        [
          {
            text: "OK",
            onPress: () => {
              setName("");
              setCodes([""]);
            },
          },
        ],
        {
          onDismiss: () => {
            setName("");
            setCodes([""]);
          },
        }
      );
    } catch (error: any) {
      Alert.alert("Erro na impressão", error.message || "Falha ao imprimir.");
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
            <Text style={stylesHome.label}>Nome do Entregador *</Text>
            <Input
              placeholder="Digite o nome do entregador"
              value={name}
              onChangeText={setName}
              maxLength={50}
            />
          </View>

          <View style={stylesHome.inputContainer}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <Text style={stylesHome.label}>Códigos do pedido IFood *</Text>
              <View style={{ width: 40 }}>
                <Button title="+" onPress={() => setCodes([...codes, ""])} />
              </View>
            </View>
            {codes.map((code, idx) => (
              <View
                key={idx}
                style={{
                  marginBottom: 8,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <View style={{ flex: 1 }}>
                  <Input
                    placeholder={`Digite o código ${idx + 1}`}
                    value={code}
                    onChangeText={(text) => {
                      const newCodes = [...codes];
                      newCodes[idx] = text;
                      setCodes(newCodes);
                    }}
                    maxLength={20}
                  />
                </View>
                {codes.length > 1 && (
                  <TouchableOpacity
                    onPress={() => {
                      const newCodes = codes.filter((_, i) => i !== idx);
                      setCodes(newCodes);
                    }}
                    style={{ marginLeft: 8, padding: 8 }}
                  >
                    <Text
                      style={{
                        color: "#ff4444",
                        fontSize: 18,
                        fontWeight: "bold",
                      }}
                    >
                      ×
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
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
            {selectedPrinter
              ? `Impressora Padrão: ${selectedPrinter.name}`
              : printerSettings
              ? `Impressora: ${printerSettings.ipAddress}:${printerSettings.port}`
              : "Nenhuma impressora configurada"}
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
