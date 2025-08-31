import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PrinterSettings {
  ipAddress: string;
  port: number;
  printStandard: string;
  timeout: number;
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
