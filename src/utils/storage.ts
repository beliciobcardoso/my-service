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

const PRINTER_SETTINGS_KEY = '@PrinterApp:printerSettings';
const SAVED_PRINTERS_KEY = '@PrinterApp:savedPrinters';
const DEFAULT_PRINTER_KEY = '@PrinterApp:defaultPrinter';

// === FUNÇÕES PARA CONFIGURAÇÕES ATUAIS ===

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

        console.log('Nenhuma configuração encontrada, retornando padrão');
        return getDefaultPrinterSettings();
    } catch (e: any) {
        console.error('Erro ao carregar configurações:', e);
        return getDefaultPrinterSettings();
    }
};

export const getDefaultPrinterSettings = (): PrinterSettings => {
    return {
        ipAddress: '192.168.1.100',
        port: 9100,
        printStandard: 'ESC/POS',
        timeout: 10
    };
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
        const savedPrinters = await getSavedPrinters();
        const updatedPrinters = savedPrinters.filter(p => p.id !== printerId);

        await AsyncStorage.setItem(SAVED_PRINTERS_KEY, JSON.stringify(updatedPrinters));

        // Se removeu a impressora padrão, definir uma nova padrão e se não houver impressoras, limpar a configuração
        const defaultPrinter = await AsyncStorage.getItem(DEFAULT_PRINTER_KEY);
        if (defaultPrinter === printerId && updatedPrinters.length > 0) {
            await setDefaultPrinter(updatedPrinters[0].id);
        } else if (updatedPrinters.length === 0) {
            await AsyncStorage.removeItem(DEFAULT_PRINTER_KEY);
            await AsyncStorage.removeItem(PRINTER_SETTINGS_KEY);
        }

        console.log('Impressora removida do cache:', printerId);
    } catch (e: any) {
        console.error('Erro ao remover impressora do cache:', e);
        throw e;
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
