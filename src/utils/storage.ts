import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PrinterSettings {
    ipAddress: string;
    port: number;
    printStandard: string;
    timeout: number;
}

export interface SavedPrinter extends PrinterSettings {
    id: string;
    name: string;
    dateCreated: string;
    dateLastUsed: string;
    isDefault: boolean;
}

export interface PrintHistory {
    id: string;
    printerName: string;
    printerId: string;
    printerIp: string;
    printStandard: string;
    nome: string;
    codigo: string;
    dateTime: string;
    status: 'success' | 'error' | 'timeout';
    errorMessage?: string;
    duration?: number; // em milissegundos
}

export interface HistorySettings {
    maxHistoryEntries: number; // Limite configurável (10-10000, padrão 100)
}

const PRINTER_SETTINGS_KEY = '@PrinterApp:printerSettings';
const SAVED_PRINTERS_KEY = '@PrinterApp:savedPrinters';
const DEFAULT_PRINTER_KEY = '@PrinterApp:defaultPrinter';
const PRINT_HISTORY_KEY = '@PrinterApp:printHistory';
const HISTORY_SETTINGS_KEY = '@PrinterApp:historySettings';

// === FUNÇÕES PARA CONFIGURAÇÕES ATUAIS ===

/* const listAll = async (): Promise<void> => {
    console.log('Impressoras salvas: ', await AsyncStorage.getItem(SAVED_PRINTERS_KEY));
    console.log("   ")
    console.log('Configurações de impressão: ', await AsyncStorage.getItem(PRINTER_SETTINGS_KEY));
    console.log("   ")
    console.log('Histórico de impressão: ', await AsyncStorage.getItem(PRINT_HISTORY_KEY));
    console.log("   ")
    console.log('Configurações de histórico: ', await AsyncStorage.getItem(HISTORY_SETTINGS_KEY));
    console.log("   ")
    console.log('Impressora padrão: ', await AsyncStorage.getItem(DEFAULT_PRINTER_KEY));
}
listAll(); */
export const savePrinterSettings = async (settings: PrinterSettings): Promise<void> => {
    try {
        console.log('Salvando configurações:', settings);
        const jsonValue = JSON.stringify(settings);
        await AsyncStorage.setItem(PRINTER_SETTINGS_KEY, jsonValue);
        console.log('Configurações salvas com sucesso!');
    } catch (e: any) {
        console.error('Erro ao salvar configurações:', e);
        throw e;
    }
};

export const getPrinterSettings = async (): Promise<PrinterSettings | null> => {
    try {
        console.log('Carregando configurações...');
        const jsonValue = await AsyncStorage.getItem(PRINTER_SETTINGS_KEY);
        if (jsonValue != null) {
            const settings = JSON.parse(jsonValue) as PrinterSettings;
            console.log('Configurações carregadas:', settings);

            // Garantir que timeout existe para configurações antigas
            if (!settings.timeout) {
                settings.timeout = 10;
            }

            return settings;
        }

        console.log('Nenhuma configuração encontrada');
        return null;
    } catch (e: any) {
        console.error('Erro ao carregar configurações:', e);
        return null;
    }
};

export const clearPrinterSettings = async (): Promise<void> => {
    try {
        await AsyncStorage.removeItem(PRINTER_SETTINGS_KEY);
    } catch (e: any) {
        console.error('Erro ao limpar configurações:', e);
        throw e;
    }
};

// === FUNÇÕES PARA CACHE DE CONFIGURAÇÕES MÚLTIPLAS ===

export const savePrinterToCache = async (
    settings: PrinterSettings,
    printerName: string
): Promise<SavedPrinter> => {
    try {
        const savedPrinters = await getSavedPrinters();

        // Verificar se já existe uma impressora com este IP
        const existingIndex = savedPrinters.findIndex(p => p.ipAddress === settings.ipAddress);

        const now = new Date().toISOString();
        const printerId = existingIndex >= 0 ? savedPrinters[existingIndex].id : generateId();

        const savedPrinter: SavedPrinter = {
            ...settings,
            id: printerId,
            name: printerName,
            dateCreated: existingIndex >= 0 ? savedPrinters[existingIndex].dateCreated : now,
            dateLastUsed: now,
            isDefault: savedPrinters.length === 0 // Primeira impressora é padrão
        };

        if (existingIndex >= 0) {
            // Atualizar impressora existente
            savedPrinters[existingIndex] = savedPrinter;
        } else {
            // Adicionar nova impressora
            savedPrinters.push(savedPrinter);
        }

        await AsyncStorage.setItem(SAVED_PRINTERS_KEY, JSON.stringify(savedPrinters));

        // Se for a primeira impressora ou marcada como padrão, definir como padrão
        if (savedPrinter.isDefault) {
            await setDefaultPrinter(savedPrinter.id);
        }

        console.log('Impressora salva no cache:', savedPrinter);
        return savedPrinter;

    } catch (e: any) {
        console.error('Erro ao salvar impressora no cache:', e);
        throw e;
    }
};

export const getSavedPrinters = async (): Promise<SavedPrinter[]> => {
    try {
        const jsonValue = await AsyncStorage.getItem(SAVED_PRINTERS_KEY);

        console.log('Impressoras salvas: ', jsonValue);

        if (jsonValue != null) {
            const printers = JSON.parse(jsonValue) as SavedPrinter[];
            console.log('Impressoras carregadas do cache:', printers.length);
            return printers;
        }

        return [];
    } catch (e: any) {
        console.error('Erro ao carregar impressoras do cache:', e);
        return [];
    }
};

export const getDefaultPrinter = async (): Promise<SavedPrinter | null> => {
    try {
        const defaultPrinterId = await AsyncStorage.getItem(DEFAULT_PRINTER_KEY);

        if (defaultPrinterId) {
            const savedPrinters = await getSavedPrinters();
            const defaultPrinter = savedPrinters.find(p => p.id === defaultPrinterId);

            if (defaultPrinter) {
                console.log('Impressora padrão carregada:', defaultPrinter.name);
                return defaultPrinter;
            }
        }

        // Se não há padrão definido, pegar a primeira disponível
        const savedPrinters = await getSavedPrinters();
        if (savedPrinters.length > 0) {
            return savedPrinters[0];
        }

        return null;
    } catch (e: any) {
        console.error('Erro ao carregar impressora padrão:', e);
        return null;
    }
};

export const setDefaultPrinter = async (printerId: string): Promise<void> => {
    try {
        await AsyncStorage.setItem(DEFAULT_PRINTER_KEY, printerId);

        // Atualizar flags isDefault nas impressoras salvas
        const savedPrinters = await getSavedPrinters();
        const updatedPrinters = savedPrinters.map(printer => ({
            ...printer,
            isDefault: printer.id === printerId
        }));

        await AsyncStorage.setItem(SAVED_PRINTERS_KEY, JSON.stringify(updatedPrinters));
        console.log('Impressora padrão definida:', printerId);
    } catch (e: any) {
        console.error('Erro ao definir impressora padrão:', e);
        throw e;
    }
};

export const deleteSavedPrinter = async (printerId: string): Promise<void> => {
    try {
        const printers = await getSavedPrinters();
        const updatedPrinters = printers.filter(printer => printer.id !== printerId);
        await AsyncStorage.setItem(SAVED_PRINTERS_KEY, JSON.stringify(updatedPrinters));
        
        // Se estava definido como padrão, remover essa definição
        const defaultPrinterId = await AsyncStorage.getItem(DEFAULT_PRINTER_KEY);
        if (defaultPrinterId === printerId) {
            await AsyncStorage.removeItem(DEFAULT_PRINTER_KEY);
        }
    } catch (error) {
        console.error('Erro ao deletar impressora:', error);
        throw error;
    }
};

// Funções do histórico de impressões
export const getHistorySettings = async (): Promise<HistorySettings> => {
    try {
        const settingsJson = await AsyncStorage.getItem(HISTORY_SETTINGS_KEY);
        if (settingsJson) {
            return JSON.parse(settingsJson);
        }
        // Configuração padrão
        const defaultSettings: HistorySettings = {
            maxHistoryEntries: 100
        };
        await saveHistorySettings(defaultSettings);
        return defaultSettings;
    } catch (error) {
        console.error('Erro ao obter configurações do histórico:', error);
        return { maxHistoryEntries: 100 };
    }
};

export const saveHistorySettings = async (settings: HistorySettings): Promise<void> => {
    try {
        // Validar limite entre 10 e 10000
        const validatedSettings = {
            ...settings,
            maxHistoryEntries: Math.min(Math.max(settings.maxHistoryEntries, 10), 10000)
        };
        await AsyncStorage.setItem(HISTORY_SETTINGS_KEY, JSON.stringify(validatedSettings));
    } catch (error) {
        console.error('Erro ao salvar configurações do histórico:', error);
        throw error;
    }
};

export const getPrintHistory = async (): Promise<PrintHistory[]> => {
    try {
        const historyJson = await AsyncStorage.getItem(PRINT_HISTORY_KEY);
        if (historyJson) {
            const history = JSON.parse(historyJson);
            // Ordenar por data mais recente primeiro
            return history.sort((a: PrintHistory, b: PrintHistory) => 
                new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
            );
        }
        return [];
    } catch (error) {
        console.error('Erro ao obter histórico de impressões:', error);
        return [];
    }
};

export const addPrintHistoryEntry = async (entry: Omit<PrintHistory, 'id' | 'dateTime'>): Promise<void> => {
    try {
        const settings = await getHistorySettings();
        const currentHistory = await getPrintHistory();
        
        // Criar nova entrada
        const newEntry: PrintHistory = {
            ...entry,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            dateTime: new Date().toISOString()
        };
        
        // Adicionar no início da lista
        const updatedHistory = [newEntry, ...currentHistory];
        
        // Limitar ao número máximo configurado
        const limitedHistory = updatedHistory.slice(0, settings.maxHistoryEntries);
        
        await AsyncStorage.setItem(PRINT_HISTORY_KEY, JSON.stringify(limitedHistory));
    } catch (error) {
        console.error('Erro ao adicionar entrada no histórico:', error);
        throw error;
    }
};

export const clearPrintHistory = async (): Promise<void> => {
    try {
        await AsyncStorage.removeItem(PRINT_HISTORY_KEY);
    } catch (error) {
        console.error('Erro ao limpar histórico:', error);
        throw error;
    }
};

export const getHistoryByDateRange = async (startDate: Date, endDate: Date): Promise<PrintHistory[]> => {
    try {
        const allHistory = await getPrintHistory();
        return allHistory.filter(entry => {
            const entryDate = new Date(entry.dateTime);
            return entryDate >= startDate && entryDate <= endDate;
        });
    } catch (error) {
        console.error('Erro ao obter histórico por período:', error);
        return [];
    }
};

export const getHistoryByPrinter = async (printerId: string): Promise<PrintHistory[]> => {
    try {
        const allHistory = await getPrintHistory();
        return allHistory.filter(entry => entry.printerId === printerId);
    } catch (error) {
        console.error('Erro ao obter histórico por impressora:', error);
        return [];
    }
};

export const getHistoryStatistics = async (): Promise<{
    totalPrints: number;
    successfulPrints: number;
    failedPrints: number;
    successRate: number;
    mostUsedPrinter: string | null;
    averageDuration: number;
}> => {
    try {
        const history = await getPrintHistory();
        console.log('Histórico para estatísticas:', history);
        
        const totalPrints = history.length;
        const successfulPrints = history.filter(entry => entry.status === 'success').length;
        const failedPrints = totalPrints - successfulPrints;
        const successRate = totalPrints > 0 ? (successfulPrints / totalPrints) * 100 : 0;
        
        // Impressora mais utilizada
        const printerUsage = history.reduce((acc, entry) => {
            acc[entry.printerName] = (acc[entry.printerName] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        
        const mostUsedPrinter = Object.keys(printerUsage).length > 0 
            ? Object.entries(printerUsage).reduce((a, b) => printerUsage[a[0]] > printerUsage[b[0]] ? a : b)[0]
            : null;
        
        // Duração média
        const durationsWithValue = history.filter(entry => entry.duration && entry.duration > 0);
        const averageDuration = durationsWithValue.length > 0
            ? durationsWithValue.reduce((sum, entry) => sum + (entry.duration || 0), 0) / durationsWithValue.length
            : 0;
        
        return {
            totalPrints,
            successfulPrints,
            failedPrints,
            successRate,
            mostUsedPrinter,
            averageDuration
        };
    } catch (error) {
        console.error('Erro ao obter estatísticas do histórico:', error);
        return {
            totalPrints: 0,
            successfulPrints: 0,
            failedPrints: 0,
            successRate: 0,
            mostUsedPrinter: null,
            averageDuration: 0
        };
    }
};

export const updateLastUsed = async (printerId: string): Promise<void> => {
    try {
        const savedPrinters = await getSavedPrinters();
        const updatedPrinters = savedPrinters.map(printer =>
            printer.id === printerId
                ? { ...printer, dateLastUsed: new Date().toISOString() }
                : printer
        );

        await AsyncStorage.setItem(SAVED_PRINTERS_KEY, JSON.stringify(updatedPrinters));
    } catch (e: any) {
        console.error('Erro ao atualizar último uso:', e);
    }
};

export const clearAllPrinters = async (): Promise<void> => {
    try {
        await AsyncStorage.removeItem(SAVED_PRINTERS_KEY);
        await AsyncStorage.removeItem(DEFAULT_PRINTER_KEY);
        console.log('Cache de impressoras limpo');
    } catch (e: any) {
        console.error('Erro ao limpar cache de impressoras:', e);
        throw e;
    }
};

// Função auxiliar para gerar IDs únicos
const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
