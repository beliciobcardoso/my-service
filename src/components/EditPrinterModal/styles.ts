import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
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
