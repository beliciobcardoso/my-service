import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { Input } from "../Input";
import { SavedPrinter, PrinterSettings } from "@/utils/storage";
import { testPrint } from "@/utils/printer";
import { styles } from "./styles";

interface EditPrinterModalProps {
  visible: boolean;
  printer: SavedPrinter | null;
  onClose: () => void;
  onSave: (
    printerId: string,
    updatedSettings: PrinterSettings,
    newName: string
  ) => Promise<void>;
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
      console.log('Carregando dados da impressora:', printer);
      setPrinterName(printer.name);
      setIpAddress(printer.ipAddress);
      setPort(printer.port.toString());
      setPrintStandard(printer.printStandard);
      setTimeout(printer.timeout?.toString() || "10");
    } else if (!visible) {
      // Limpar campos quando modal fechar
      setPrinterName("");
      setIpAddress("");
      setPort("");
      setPrintStandard("ESC/POS");
      setTimeout("");
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

  console.log('Renderizando modal com dados:', { printerName, ipAddress, port, visible });

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleClose}
      >
        <View style={styles.container}>
          <View style={styles.modalContainer}>
            <View style={styles.header}>
              <Text style={styles.title}>Editar Impressora</Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>X</Text>
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.content}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
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
          </View>
        </View>
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
