import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Input } from "../Input";
import { SavedPrinter, PrinterSettings } from "@/utils/storage";
import { testPrint } from "@/utils/printer";
import { StyleSheet } from "react-native";

interface EditPrinterModalProps {
  visible: boolean;
  printer: SavedPrinter | null;
  onClose: () => void;
  onSave: (printerId: string, updatedSettings: PrinterSettings, newName: string) => Promise<void>;
}

export function EditPrinterModal({
  visible,
  printer,
  onClose,
  onSave,
}: EditPrinterModalProps) {
  const [printerName, setPrinterName] = useState("");
  const [ipAddress, setIpAddress] = useState("");
  const [port, setPort] = useState("");
  const [printStandard, setPrintStandard] = useState("ESC/POS");
  const [timeout, setTimeout] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [showStandardModal, setShowStandardModal] = useState(false);

  const standards = [
    { label: "ESC/POS", value: "ESC/POS" },
    { label: "ZPL (Zebra)", value: "ZPL" },
    { label: "EPL (Eltron)", value: "EPL" },
  ];

  // Carregar dados da impressora quando o modal abrir
  useEffect(() => {
    if (visible && printer) {
      setPrinterName(printer.name);
      setIpAddress(printer.ipAddress);
      setPort(printer.port.toString());
      setPrintStandard(printer.printStandard);
      setTimeout(printer.timeout?.toString() || "10");
    }
  }, [visible, printer]);

  const validateIP = (ip: string): boolean => {
    const ipRegex =
      /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(ip);
  };

  const validatePort = (portStr: string): boolean => {
    const portNum = parseInt(portStr, 10);
    return !isNaN(portNum) && portNum > 0 && portNum <= 65535;
  };

  const handleStandardSelect = (value: string) => {
    setPrintStandard(value);
    setShowStandardModal(false);
  };

  const handleSave = async () => {
    if (!printer) return;

    // Validações
    if (!printerName.trim()) {
      Alert.alert("Erro", "Por favor, insira um nome para a impressora.");
      return;
    }

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

    if (
      !timeout.trim() ||
      isNaN(parseInt(timeout.trim(), 10)) ||
      parseInt(timeout.trim(), 10) <= 0
    ) {
      Alert.alert(
        "Erro",
        "Por favor, insira um tempo limite válido (em segundos)."
      );
      return;
    }

    setIsLoading(true);

    try {
      const updatedSettings: PrinterSettings = {
        ipAddress: ipAddress.trim(),
        port: parseInt(port.trim(), 10),
        printStandard: printStandard,
        timeout: parseInt(timeout.trim(), 10),
      };

      await onSave(printer.id, updatedSettings, printerName.trim());
      Alert.alert("Sucesso", "Impressora atualizada com sucesso!", [
        { text: "OK", onPress: onClose },
      ]);
    } catch (error: any) {
      Alert.alert("Erro", "Falha ao atualizar impressora: " + error.message);
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
      const testSettings: PrinterSettings = {
        ipAddress: ipAddress.trim(),
        port: parseInt(port.trim(), 10),
        printStandard: printStandard,
        timeout: parseInt(timeout.trim(), 10),
      };

      const result = await testPrint(testSettings);

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

  const handleClose = () => {
    if (!isLoading && !isTesting) {
      onClose();
    }
  };

  if (!printer) return null;

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleClose}
      >
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Editar Impressora</Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView style={styles.content}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nome da Impressora *</Text>
              <Input
                placeholder="Ex: Cozinha"
                value={printerName}
                onChangeText={setPrinterName}
                maxLength={25}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Endereço IP *</Text>
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
              <Text style={styles.label}>Porta *</Text>
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
              <TouchableOpacity
                style={styles.customPicker}
                onPress={() => setShowStandardModal(true)}
              >
                <Text style={styles.customPickerText}>
                  {standards.find((s) => s.value === printStandard)?.label ||
                    "Selecione..."}
                </Text>
                <Text style={styles.customPickerArrow}>▼</Text>
              </TouchableOpacity>
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
                onPress={handleSave}
                disabled={isLoading}
              >
                <Text style={styles.buttonText}>
                  {isLoading ? "Salvando..." : "Salvar Alterações"}
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
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal para seleção de padrão de impressão */}
      <Modal
        visible={showStandardModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowStandardModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecione o Padrão</Text>
            {standards.map((standard) => (
              <TouchableOpacity
                key={standard.value}
                style={[
                  styles.modalOption,
                  printStandard === standard.value &&
                    styles.modalOptionSelected,
                ]}
                onPress={() => handleStandardSelect(standard.value)}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    printStandard === standard.value &&
                      styles.modalOptionTextSelected,
                  ]}
                >
                  {standard.label}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setShowStandardModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 60,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  closeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  closeButtonText: {
    color: "#6200EE",
    fontSize: 16,
    fontWeight: "500",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2c3e50",
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  inputContainer: {
    marginBottom: 20,
    marginTop: 20,
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
  customPicker: {
    borderWidth: 2,
    borderColor: "#6200EE",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 50,
  },
  customPickerText: {
    fontSize: 16,
    color: "#2c3e50",
    flex: 1,
  },
  customPickerArrow: {
    fontSize: 14,
    color: "#6200EE",
    fontWeight: "bold",
  },
  buttonContainer: {
    marginTop: 30,
    marginBottom: 40,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    minHeight: 50,
  },
  primaryButton: {
    backgroundColor: "#6200EE",
  },
  testButton: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#6200EE",
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  testButtonText: {
    color: "#6200EE",
    fontSize: 16,
    fontWeight: "600",
  },
  // Estilos do modal de seleção de padrão
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "85%",
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 20,
    textAlign: "center",
  },
  modalOption: {
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#f8f9fa",
  },
  modalOptionSelected: {
    backgroundColor: "#6200EE",
  },
  modalOptionText: {
    fontSize: 16,
    color: "#2c3e50",
    textAlign: "center",
  },
  modalOptionTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
  modalCancel: {
    paddingVertical: 15,
    marginTop: 10,
    alignItems: "center",
  },
  modalCancelText: {
    fontSize: 16,
    color: "#6200EE",
    fontWeight: "600",
  },
});
