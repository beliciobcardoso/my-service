import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f7fa",
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingBottom: 20,
        paddingTop: 10,
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
        padding: 8,
        marginBottom: 10,
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
