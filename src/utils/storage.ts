import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PrinterSettings {
  ipAddress: string;
  port: number;
  printStandard: string;
}

const PRINTER_SETTINGS_KEY = '@PrinterApp:printerSettings';

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
    const jsonValue = await AsyncStorage.getItem(PRINTER_SETTINGS_KEY);
    
    if (jsonValue != null) {
      const parsed = JSON.parse(jsonValue) as PrinterSettings;
      console.log('Configurações carregadas:', parsed);
      return parsed;
    } else {
      console.log('Nenhuma configuração encontrada');
      return null;
    }
  } catch (e: any) {
    console.error('Erro ao carregar configurações:', e);
    throw e;
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
