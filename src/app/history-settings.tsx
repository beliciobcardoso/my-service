import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Alert,
    ScrollView,
    TextInput
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
    getHistorySettings,
    saveHistorySettings,
    HistorySettings
} from '../utils/storage';
import { historySettingsStyles as styles } from '../styles/historySettingsStyles';

export default function HistorySettingsScreen() {
    const [settings, setSettings] = useState<HistorySettings>({
        maxHistoryEntries: 100
    });
    const [tempValue, setTempValue] = useState('100');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const currentSettings = await getHistorySettings();
            setSettings(currentSettings);
            setTempValue(currentSettings.maxHistoryEntries.toString());
        } catch (error) {
            console.error('Erro ao carregar configurações:', error);
        } finally {
            setLoading(false);
        }
    };

    const validateAndSave = async () => {
        const value = parseInt(tempValue);
        
        if (isNaN(value)) {
            Alert.alert('Erro', 'Por favor, insira um número válido');
            return;
        }
        
        if (value < 10 || value > 10000) {
            Alert.alert(
                'Valor Inválido',
                'O limite deve estar entre 10 e 10.000 entradas'
            );
            return;
        }

        try {
            const newSettings: HistorySettings = {
                maxHistoryEntries: value
            };
            
            await saveHistorySettings(newSettings);
            setSettings(newSettings);
            
            Alert.alert(
                'Sucesso',
                'Configurações salvas com sucesso!',
                [
                    {
                        text: 'OK',
                        onPress: () => router.back()
                    }
                ]
            );
        } catch (error) {
            Alert.alert('Erro', 'Erro ao salvar configurações');
            console.error('Erro ao salvar:', error);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.center]}>
                <Text>Carregando configurações...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView style={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Limite de Entradas</Text>
                    <Text style={styles.sectionDescription}>
                        Define quantas impressões serão mantidas no histórico. 
                        Entradas mais antigas serão automaticamente removidas quando o limite for atingido.
                    </Text>
                    
                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>
                            Máximo de entradas (10 - 10.000)
                        </Text>
                        <TextInput
                            style={styles.input}
                            value={tempValue}
                            onChangeText={setTempValue}
                            keyboardType="numeric"
                            placeholder="100"
                            maxLength={5}
                        />
                        <Text style={styles.inputHelper}>
                            Valor atual: {settings.maxHistoryEntries} entradas
                        </Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Sugestões de Configuração</Text>
                    
                    <View style={styles.presetContainer}>
                        <TouchableOpacity
                            style={[
                                styles.presetButton,
                                tempValue === '50' && styles.presetButtonActive
                            ]}
                            onPress={() => setTempValue('50')}
                        >
                            <Text style={[
                                styles.presetButtonText,
                                tempValue === '50' && styles.presetButtonTextActive
                            ]}>
                                50 - Uso leve
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.presetButton,
                                tempValue === '100' && styles.presetButtonActive
                            ]}
                            onPress={() => setTempValue('100')}
                        >
                            <Text style={[
                                styles.presetButtonText,
                                tempValue === '100' && styles.presetButtonTextActive
                            ]}>
                                100 - Padrão
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.presetButton,
                                tempValue === '500' && styles.presetButtonActive
                            ]}
                            onPress={() => setTempValue('500')}
                        >
                            <Text style={[
                                styles.presetButtonText,
                                tempValue === '500' && styles.presetButtonTextActive
                            ]}>
                                500 - Uso moderado
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.presetButton,
                                tempValue === '1000' && styles.presetButtonActive
                            ]}
                            onPress={() => setTempValue('1000')}
                        >
                            <Text style={[
                                styles.presetButtonText,
                                tempValue === '1000' && styles.presetButtonTextActive
                            ]}>
                                1.000 - Uso intenso
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Informações</Text>
                    <View style={styles.infoContainer}>
                        <View style={styles.infoItem}>
                            <Ionicons name="information-circle" size={20} color="#007AFF" />
                            <Text style={styles.infoText}>
                                O histórico é armazenado localmente no dispositivo
                            </Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Ionicons name="shield-checkmark" size={20} color="#4CAF50" />
                            <Text style={styles.infoText}>
                                Seus dados são privados e não são compartilhados
                            </Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Ionicons name="refresh" size={20} color="#FF9800" />
                            <Text style={styles.infoText}>
                                Entradas antigas são removidas automaticamente
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[
                        styles.primaryButton,
                        tempValue === settings.maxHistoryEntries.toString() && styles.disabledButton
                    ]}
                    onPress={validateAndSave}
                    disabled={tempValue === settings.maxHistoryEntries.toString()}
                >
                    <Text style={[
                        styles.primaryButtonText,
                        tempValue === settings.maxHistoryEntries.toString() && styles.disabledButtonText
                    ]}>
                        Salvar Configurações
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
