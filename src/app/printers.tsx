import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import {
  getSavedPrinters,
  getDefaultPrinter,
  setDefaultPrinter,
  deleteSavedPrinter,
  SavedPrinter,
} from "../utils/storage";

export default function PrintersScreen() {
  const [savedPrinters, setSavedPrinters] = useState<SavedPrinter[]>([]);
  const [defaultPrinterId, setDefaultPrinterId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadPrinters = async () => {
    try {
      const printers = await getSavedPrinters();
      const defaultPrinter = await getDefaultPrinter();
      
      setSavedPrinters(printers);
      setDefaultPrinterId(defaultPrinter?.id || null);
    } catch (error) {
      console.error("Erro ao carregar impressoras:", error);
      Alert.alert("Erro", "Não foi possível carregar as impressoras salvas.");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPrinters();
    setRefreshing(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      loadPrinters();
    }, [])
  );

  const handleSetDefault = async (printerId: string) => {
    try {
      await setDefaultPrinter(printerId);
      setDefaultPrinterId(printerId);
      Alert.alert("Sucesso", "Impressora padrão definida!");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível definir a impressora padrão.");
    }
  };

  const handleDeletePrinter = async (printer: SavedPrinter) => {
    Alert.alert(
      "Remover Impressora",
      `Deseja remover a impressora "${printer.name}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteSavedPrinter(printer.id);
              await loadPrinters();
              Alert.alert("Sucesso", "Impressora removida!");
            } catch (error) {
              Alert.alert("Erro", "Não foi possível remover a impressora.");
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStandardIcon = (standard: string) => {
    switch (standard) {
      case "ESC/POS":
        return "receipt-outline";
      case "ZPL":
        return "barcode-outline";
      case "EPL":
        return "print-outline";
      default:
        return "hardware-chip-outline";
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.loadingText}>Carregando impressoras...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Impressoras Salvas</Text>
          <Text style={styles.subtitle}>
            {savedPrinters.length} impressora(s) configurada(s)
          </Text>
        </View>

        {savedPrinters.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="print-outline" size={64} color="#bdc3c7" />
            <Text style={styles.emptyTitle}>Nenhuma impressora salva</Text>
            <Text style={styles.emptyText}>
              Configure uma impressora na tela de configurações para começar.
            </Text>
          </View>
        ) : (
          savedPrinters.map((printer) => (
            <View key={printer.id} style={styles.printerCard}>
              <View style={styles.printerHeader}>
                <View style={styles.printerTitle}>
                  <Ionicons
                    name={getStandardIcon(printer.printStandard)}
                    size={24}
                    color="#6200EE"
                    style={styles.printerIcon}
                  />
                  <View style={styles.printerInfo}>
                    <Text style={styles.printerName}>{printer.name}</Text>
                    <Text style={styles.printerAddress}>
                      {printer.ipAddress}:{printer.port}
                    </Text>
                  </View>
                  {printer.id === defaultPrinterId && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultText}>PRINCIPAL</Text>
                    </View>
                  )}
                </View>

                <View style={styles.actionsContainer}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleSetDefault(printer.id)}
                  >
                    <Ionicons
                      name={
                        printer.id === defaultPrinterId
                          ? "star"
                          : "star-outline"
                      }
                      size={20}
                      color={
                        printer.id === defaultPrinterId ? "#f1c40f" : "#7f8c8d"
                      }
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDeletePrinter(printer)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#e74c3c" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.printerDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Padrão:</Text>
                  <Text style={styles.detailValue}>{printer.printStandard}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Timeout:</Text>
                  <Text style={styles.detailValue}>{printer.timeout}s</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Criada:</Text>
                  <Text style={styles.detailValue}>
                    {formatDate(printer.dateCreated)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Último uso:</Text>
                  <Text style={styles.detailValue}>
                    {formatDate(printer.dateLastUsed)}
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#7f8c8d",
    textAlign: "center",
    marginTop: 5,
  },
  loadingText: {
    fontSize: 18,
    color: "#7f8c8d",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#7f8c8d",
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: "#95a5a6",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 40,
  },
  printerCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  printerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  printerTitle: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  printerIcon: {
    marginRight: 12,
  },
  printerInfo: {
    flex: 1,
  },
  printerName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 4,
  },
  printerAddress: {
    fontSize: 14,
    color: "#7f8c8d",
  },
  defaultBadge: {
    backgroundColor: "#6200EE",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 12,
  },
  defaultText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "bold",
  },
  actionsContainer: {
    flexDirection: "column",
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  printerDetails: {
    borderTopWidth: 1,
    borderTopColor: "#e1e8ed",
    paddingTop: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 14,
    color: "#7f8c8d",
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 14,
    color: "#2c3e50",
    fontWeight: "600",
  },
});
