import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
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
        flexDirection: "column",
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
        flexDirection: "row",
        width: "100%",
        justifyContent: "flex-end",
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
