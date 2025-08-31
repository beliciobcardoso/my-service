import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from "react-native";
import {
  savePrinterSettings,
  getPrinterSettings,
  PrinterSettings,
} from "../utils/storage";
import { testPrint } from "../utils/printer";
import { Input } from "@/components/Input";

export default function SettingsScreen() {
  const [ipAddress, setIpAddress] = useState<string>("");
  const [port, setPort] = useState<string>("9100");
  const [printStandard, setPrintStandard] = useState<string>("ESC/POS");
  const [timeout, setTimeout] = useState<string>("10");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [showPickerModal, setShowPickerModal] = useState<boolean>(false);

  const standards = [
    { label: "ESC/POS", value: "ESC/POS" },
    { label: "ZPL (Zebra)", value: "ZPL" },
    { label: "EPL (Eltron)", value: "EPL" }
  ];

  const handleStandardSelect = (value: string) => {
    setPrintStandard(value);
    setShowPickerModal(false);
  };

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await getPrinterSettings();
        if (settings) {
          setIpAddress(settings.ipAddress);
          setPort(settings.port.toString());
          setPrintStandard(settings.printStandard);
          setTimeout(settings.timeout?.toString() || "10");
        }
      } catch (error) {
        console.error("Erro ao carregar configurações:", error);
      }
    };

    loadSettings();
  }, []);

  const validateIP = (ip: string): boolean => {
    const ipRegex =
      /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(ip);
  };

  const validatePort = (portStr: string): boolean => {
    const portNum = parseInt(portStr, 10);
    return !isNaN(portNum) && portNum > 0 && portNum <= 65535;
  };

  const handleSaveSettings = async () => {
    if (!ipAddress.trim()) {
      Alert.alert("Erro", "Por favor, insira o endereço IP da impressora.");
      return;
    }

    if (!validateIP(ipAddress.trim())) {
      Alert.alert(
        "Erro",
        "Por favor, insira um endereço IP válido (ex: 192.168.1.100)."
      );
      return;
    }

    if (!port.trim()) {
      Alert.alert("Erro", "Por favor, insira a porta da impressora.");
      return;
    }

    if (!validatePort(port.trim())) {
      Alert.alert("Erro", "Por favor, insira uma porta válida (1-65535).");
      return;
    }

    setIsLoading(true);

    try {
      const settings: PrinterSettings = {
        ipAddress: ipAddress.trim(),
        port: parseInt(port.trim(), 10),
        printStandard: printStandard,
        timeout: parseInt(timeout.trim(), 10),
      };

      await savePrinterSettings(settings);
      Alert.alert("Sucesso", "Configurações salvas com sucesso!");
    } catch (error: any) {
      Alert.alert("Erro", "Falha ao salvar configurações: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestPrint = async () => {
    if (!ipAddress.trim() || !port.trim()) {
      Alert.alert(
        "Erro",
        "Por favor, preencha o IP e a porta antes de testar."
      );
      return;
    }

    if (!validateIP(ipAddress.trim()) || !validatePort(port.trim())) {
      Alert.alert(
        "Erro",
        "Por favor, verifique se o IP e a porta estão válidos."
      );
      return;
    }

    setIsTesting(true);

    try {
      const settings: PrinterSettings = {
        ipAddress: ipAddress.trim(),
        port: parseInt(port.trim(), 10),
        printStandard: printStandard,
        timeout: parseInt(timeout.trim(), 10),
      };

      const result = await testPrint(settings);

      if (result.success) {
        Alert.alert("Sucesso", result.message);
      } else {
        Alert.alert(
          "Erro no teste",
          result.message +
            (result.details ? "\n\nDetalhes: " + result.details : "")
        );
      }
    } catch (error: any) {
      Alert.alert(
        "Erro no teste",
        error.message || "Falha ao executar teste de impressão."
      );
    } finally {
      setIsTesting(false);
    }
  };

  const handleClearForm = () => {
    Alert.alert(
      "Limpar configurações",
      "Tem certeza que deseja limpar todas as configurações?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Limpar",
          style: "destructive",
          onPress: () => {
            setIpAddress("");
            setPort("9100");
            setPrintStandard("ESC/POS");
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>Configurações da Impressora</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Endereço IP da Impressora *</Text>
            <Input
              placeholder="Ex: 192.168.1.100"
              value={ipAddress}
              onChangeText={setIpAddress}
              keyboardType="numeric"
              maxLength={15}
            />
            <Text style={styles.helpText}>
              Digite o endereço IP da impressora na rede local
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Porta da Impressora *</Text>
            <Input
              placeholder="Ex: 9100"
              value={port}
              onChangeText={setPort}
              keyboardType="numeric"
              maxLength={5}
            />
            <Text style={styles.helpText}>
              Porta padrão para impressoras ESC/POS: 9100
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Padrão de Impressão</Text>

            {/* Alternativa: Picker Personalizado com Modal */}
            <TouchableOpacity
              style={styles.customPicker}
              onPress={() => setShowPickerModal(true)}
            >
              <Text style={styles.customPickerText}>
                {standards.find(s => s.value === printStandard)?.label || "Selecione..."}
              </Text>
              <Text style={styles.customPickerArrow}>▼</Text>
                </TouchableOpacity>

                <Modal
                visible={showPickerModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowPickerModal(false)}
                >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Selecione o Padrão</Text>
                    {standards.map((standard) => (
                        <TouchableOpacity
                        key={standard.value}
                        style={[
                            styles.modalOption,
                            printStandard === standard.value && styles.modalOptionSelected
                        ]}
                        onPress={() => handleStandardSelect(standard.value)}
                        >
                        <Text style={[
                        styles.modalOptionText,
                        printStandard === standard.value && styles.modalOptionTextSelected
                      ]}>
                        {standard.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity
                    style={styles.modalCancel}
                    onPress={() => setShowPickerModal(false)}
                  >
                    <Text style={styles.modalCancelText}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Timeout (segundos)</Text>
            <Input
              value={timeout}
              onChangeText={setTimeout}
              returnKeyType="done"
              keyboardType="numeric"
              placeholder="10"
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.button,
                styles.primaryButton,
                isLoading && styles.disabledButton,
              ]}
              onPress={handleSaveSettings}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? "Salvando..." : "Salvar Configurações"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.testButton,
                isTesting && styles.disabledButton,
              ]}
              onPress={handleTestPrint}
              disabled={isTesting}
            >
              <Text style={styles.testButtonText}>
                {isTesting ? "Testando..." : "Testar Impressão"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={handleClearForm}
            >
              <Text style={styles.secondaryButtonText}>
                Limpar Configurações
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Instruções</Text>
          <Text style={styles.infoText}>
            1. Certifique-se de que a impressora está conectada à mesma rede
            Wi-Fi{"\n"}
            2. Verifique o endereço IP da impressora no painel de configurações
            {"\n"}
            3. A porta padrão para impressoras ESC/POS é 9100{"\n"}
            4. Use o teste de impressão para verificar a conectividade
          </Text>
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
  formContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 5,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 20,
    textAlign: "center",
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
  helpText: {
    fontSize: 12,
    color: "#7f8c8d",
    marginTop: 4,
    fontStyle: "italic",
  },
  // Estilos para picker personalizado (se necessário)
  customPicker: {
    height: 48,
    borderColor: "#e1e8ed",
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },
  customPickerText: {
    fontSize: 16,
    color: "#2c3e50",
    flex: 1,
  },
  customPickerArrow: {
    fontSize: 12,
    color: "#7f8c8d",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    width: "80%",
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 20,
    textAlign: "center",
  },
  modalOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e1e8ed",
  },
  modalOptionSelected: {
    backgroundColor: "#6200EE",
  },
  modalOptionText: {
    fontSize: 16,
    color: "#2c3e50",
  },
  modalOptionTextSelected: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  modalCancel: {
    marginTop: 10,
    padding: 15,
    backgroundColor: "#e74c3c",
    borderRadius: 8,
  },
  modalCancelText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
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
  testButton: {
    backgroundColor: "#27ae60",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#e74c3c",
  },
  disabledButton: {
    backgroundColor: "#bdc3c7",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  testButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButtonText: {
    color: "#e74c3c",
    fontSize: 16,
    fontWeight: "600",
  },
  infoContainer: {
    backgroundColor: "#ecf0f1",
    borderRadius: 8,
    padding: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#34495e",
    lineHeight: 20,
  },
});
