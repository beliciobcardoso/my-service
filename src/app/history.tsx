import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Alert,
    Modal,
    ScrollView,
    RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import {
    getPrintHistory,
    clearPrintHistory,
    getHistoryStatistics,
    PrintHistory
} from '../utils/storage';
import { historyStyles } from '../styles/historyStyles';

interface HistoryStats {
    totalPrints: number;
    successfulPrints: number;
    failedPrints: number;
    successRate: number;
    mostUsedPrinter: string | null;
    averageDuration: number;
}

export default function HistoryScreen() {
    const [history, setHistory] = useState<PrintHistory[]>([]);
    const [filteredHistory, setFilteredHistory] = useState<PrintHistory[]>([]);
    const [stats, setStats] = useState<HistoryStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showStats, setShowStats] = useState(false);
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [selectedPrinter, setSelectedPrinter] = useState<string>('all');
    const [printers, setPrinters] = useState<string[]>([]);

    const loadHistory = async () => {
        try {
            setLoading(true);
            const [historyData, statsData] = await Promise.all([
                getPrintHistory(),
                getHistoryStatistics()
            ]);
            
            setHistory(historyData);
            setFilteredHistory(historyData);
            setStats(statsData);
            
            // Extrair nomes únicos das impressoras do histórico
            const uniquePrinterNames = [...new Set(historyData.map(entry => entry.printerName))];
            setPrinters(['all', ...uniquePrinterNames.sort()]);
        } catch (error) {
            console.error('Erro ao carregar histórico:', error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadHistory();
        setRefreshing(false);
    };

    useFocusEffect(
        useCallback(() => {
            loadHistory();
        }, [])
    );

    const handleClearHistory = () => {
        Alert.alert(
            'Limpar Histórico',
            'Tem certeza que deseja limpar todo o histórico de impressões? Esta ação não pode ser desfeita.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Limpar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await clearPrintHistory();
                            await loadHistory();
                            Alert.alert('Sucesso', 'Histórico limpo com sucesso!');
                        } catch (error) {
                            Alert.alert('Erro', 'Erro ao limpar histórico');
                        }
                    }
                }
            ]
        );
    };

    const filterByPrinter = (printerName: string) => {
        setSelectedPrinter(printerName);
        if (printerName === 'all') {
            setFilteredHistory(history);
        } else {
            const filtered = history.filter(entry => entry.printerName === printerName);
            setFilteredHistory(filtered);
        }
        setFilterModalVisible(false);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('pt-BR');
    };

    const formatDuration = (duration?: number) => {
        if (!duration || duration <= 0) return 'N/A';
        return duration < 1000 
            ? `${Math.round(duration)}ms`
            : `${(duration / 1000).toFixed(2)}s`;
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'success':
                return { name: 'checkmark-circle', color: '#4CAF50' };
            case 'error':
                return { name: 'close-circle', color: '#F44336' };
            case 'timeout':
                return { name: 'time', color: '#FF9800' };
            default:
                return { name: 'help-circle', color: '#9E9E9E' };
        }
    };

    const renderHistoryItem = ({ item }: { item: PrintHistory }) => {
        const statusIcon = getStatusIcon(item.status);
        
        return (
            <View style={historyStyles.historyCard}>
                <View style={historyStyles.historyHeader}>
                    <View style={historyStyles.historyInfo}>
                        <Text style={historyStyles.historyName}>Nome: {item.nome}</Text>
                        <Text style={historyStyles.historyCode}>Código: {item.codigo}</Text>
                        <Text style={historyStyles.historyPrinter}>
                            <Ionicons name="print" size={12} color="#666" />{' '}{item.printerName}
                        </Text>
                    </View>
                    <View style={historyStyles.historyStatus}>
                        <Ionicons
                            name={statusIcon.name as any}
                            size={24}
                            color={statusIcon.color}
                        />
                        <Text style={[historyStyles.statusText, { color: statusIcon.color }]}>
                            {item.status === 'success' ? 'Sucesso' : 
                             item.status === 'error' ? 'Erro' : 'Timeout'}
                        </Text>
                    </View>
                </View>
                
                <View style={historyStyles.historyDetails}>
                    <Text style={historyStyles.historyDate}>
                        <Ionicons name="time" size={12} color="#666" /> {formatDate(item.dateTime)}
                    </Text>
                    <Text style={historyStyles.historyDuration}>
                        Duração: {formatDuration(item.duration)}
                    </Text>
                </View>
                
                {item.errorMessage && (
                    <View style={historyStyles.errorContainer}>
                        <Text style={historyStyles.errorText}>Erro: {item.errorMessage}</Text>
                    </View>
                )}
            </View>
        );
    };

    const renderStatsModal = () => (
        <Modal
            visible={showStats}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowStats(false)}
        >
            <View style={historyStyles.modalOverlay}>
                <View style={historyStyles.statsModal}>
                    <View style={historyStyles.modalHeader}>
                        <Text style={historyStyles.modalTitle}>Estatísticas do Histórico</Text>
                        <TouchableOpacity onPress={() => setShowStats(false)}>
                            <Ionicons name="close" size={24} color="#333" />
                        </TouchableOpacity>
                    </View>
                    
                    {stats && (
                        <ScrollView style={historyStyles.statsContent}>
                            <View style={historyStyles.statItem}>
                                <Text style={historyStyles.statLabel}>Total de Impressões</Text>
                                <Text style={historyStyles.statValue}>{stats.totalPrints}</Text>
                            </View>
                            
                            <View style={historyStyles.statItem}>
                                <Text style={historyStyles.statLabel}>Impressões Bem-sucedidas</Text>
                                <Text style={[historyStyles.statValue, { color: '#4CAF50' }]}>
                                    {stats.successfulPrints}
                                </Text>
                            </View>
                            
                            <View style={historyStyles.statItem}>
                                <Text style={historyStyles.statLabel}>Impressões com Falha</Text>
                                <Text style={[historyStyles.statValue, { color: '#F44336' }]}>
                                    {stats.failedPrints}
                                </Text>
                            </View>
                            
                            <View style={historyStyles.statItem}>
                                <Text style={historyStyles.statLabel}>Taxa de Sucesso</Text>
                                <Text style={[historyStyles.statValue, { 
                                    color: stats.successRate >= 90 ? '#4CAF50' : 
                                           stats.successRate >= 70 ? '#FF9800' : '#F44336' 
                                }]}>
                                    {stats.successRate.toFixed(1)}%
                                </Text>
                            </View>
                            
                            {stats.mostUsedPrinter && (
                                <View style={historyStyles.statItemColumn}>
                                    <Text style={historyStyles.statLabel}>Impressora Mais Usada</Text>
                                    <Text style={historyStyles.statValue}>{stats.mostUsedPrinter}</Text>
                                </View>
                            )}
                            
                            <View style={historyStyles.statItem}>
                                <Text style={historyStyles.statLabel}>Duração Média</Text>
                                <Text style={historyStyles.statValue}>
                                    {formatDuration(stats.averageDuration)}
                                </Text>
                            </View>
                        </ScrollView>
                    )}
                </View>
            </View>
        </Modal>
    );

    const renderFilterModal = () => (
        <Modal
            visible={filterModalVisible}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setFilterModalVisible(false)}
        >
            <View style={historyStyles.modalOverlay}>
                <View style={historyStyles.filterModal}>
                    <View style={historyStyles.modalHeader}>
                        <Text style={historyStyles.modalTitle}>Filtrar por Impressora</Text>
                        <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                            <Ionicons name="close" size={24} color="#333" />
                        </TouchableOpacity>
                    </View>
                    
                    <ScrollView style={historyStyles.filterContent}>
                        {printers.map(printer => (
                            <TouchableOpacity
                                key={printer}
                                style={[
                                    historyStyles.filterOption,
                                    selectedPrinter === printer && historyStyles.filterOptionSelected
                                ]}
                                onPress={() => filterByPrinter(printer)}
                            >
                                <Text style={[
                                    historyStyles.filterOptionText,
                                    selectedPrinter === printer && historyStyles.filterOptionTextSelected
                                ]}>
                                    {printer === 'all' ? 'Todas as Impressoras' : printer}
                                </Text>
                                {selectedPrinter === printer && (
                                    <Ionicons name="checkmark" size={20} color="#007AFF" />
                                )}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );

    return (
        <View style={historyStyles.container}>
            <View style={historyStyles.actionBar}>
                <TouchableOpacity
                    style={historyStyles.actionButton}
                    onPress={() => setShowStats(true)}
                >
                    <Ionicons name="analytics" size={20} color="#007AFF" />
                    <Text style={historyStyles.actionButtonText}>Estatísticas</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={historyStyles.actionButton}
                    onPress={() => setFilterModalVisible(true)}
                >
                    <Ionicons name="filter" size={20} color="#007AFF" />
                    <Text style={historyStyles.actionButtonText}>Filtrar</Text>
                    {selectedPrinter !== 'all' && <View style={historyStyles.filterDot} />}
                </TouchableOpacity>

                <TouchableOpacity
                    style={[historyStyles.actionButton, { opacity: history.length === 0 ? 0.5 : 1 }]}
                    onPress={handleClearHistory}
                    disabled={history.length === 0}
                >
                    <Ionicons name="trash" size={20} color="#F44336" />
                    <Text style={[historyStyles.actionButtonText, { color: '#F44336' }]}>Limpar</Text>
                </TouchableOpacity>
            </View>

            {filteredHistory.length === 0 ? (
                <View style={historyStyles.emptyState}>
                    <Ionicons name="document-text" size={64} color="#ccc" />
                    <Text style={historyStyles.emptyText}>
                        {history.length === 0 
                            ? 'Nenhuma impressão realizada ainda'
                            : 'Nenhuma impressão encontrada com o filtro selecionado'
                        }
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={filteredHistory}
                    keyExtractor={(item) => item.id}
                    renderItem={renderHistoryItem}
                    style={historyStyles.list}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                />
            )}

            {renderStatsModal()}
            {renderFilterModal()}
        </View>
    );
}
