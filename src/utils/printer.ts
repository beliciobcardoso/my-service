// utils/printer.ts
import { PrinterSettings, getDefaultPrinterSettings } from './storage';
import TcpSocket from 'react-native-tcp-socket';

// Função para simular a impressão já que a biblioteca real pode não funcionar no Expo Go
// Em um ambiente de produção, você usaria uma biblioteca como react-native-esc-pos-printer
// ou react-native-tcp-socket para comunicação direta com impressoras em rede

// Função para normalizar texto para impressão ESC/POS
const normalizeTextForPrinting = (text: string): string => {
  // Mapeamento de caracteres acentuados para compatibilidade com CP860
  const charMap: { [key: string]: string } = {
    'á': 'a', 'à': 'a', 'ã': 'a', 'â': 'a', 'ä': 'a',
    'é': 'e', 'è': 'e', 'ê': 'e', 'ë': 'e',
    'í': 'i', 'ì': 'i', 'î': 'i', 'ï': 'i',
    'ó': 'o', 'ò': 'o', 'õ': 'o', 'ô': 'o', 'ö': 'o',
    'ú': 'u', 'ù': 'u', 'û': 'u', 'ü': 'u',
    'ç': 'c',
    'Á': 'A', 'À': 'A', 'Ã': 'A', 'Â': 'A', 'Ä': 'A',
    'É': 'E', 'È': 'E', 'Ê': 'E', 'Ë': 'E',
    'Í': 'I', 'Ì': 'I', 'Î': 'I', 'Ï': 'I',
    'Ó': 'O', 'Ò': 'O', 'Õ': 'O', 'Ô': 'O', 'Ö': 'O',
    'Ú': 'U', 'Ù': 'U', 'Û': 'U', 'Ü': 'U',
    'Ç': 'C'
  };

  return text.replace(/[áàãâäéèêëíìîïóòõôöúùûüçÁÀÃÂÄÉÈÊËÍÌÎÏÓÒÕÔÖÚÙÛÜÇ]/g, (match) => {
    return charMap[match] || match;
  });
};

// Função para gerar comandos baseados no padrão de impressão
const generatePrintCommands = (settings: PrinterSettings, content: string): string => {
  let commands = '';
  
  // Normalizar o conteúdo para evitar problemas de codificação
  const normalizedContent = normalizeTextForPrinting(content);
  
  switch (settings.printStandard) {
    case 'ESC/POS':
      const ESC = '\x1B';
      const GS = '\x1D';
      
      commands += ESC + '@'; // Inicializar impressora
      commands += ESC + 't' + String.fromCharCode(16); // Codepage 860 (Português)
      commands += ESC + 'a' + String.fromCharCode(1); // Centralizar
      commands += normalizedContent + '\n';
      commands += ESC + 'd' + String.fromCharCode(3); // Alimentar papel
      commands += GS + 'V' + String.fromCharCode(0); // Corte completo
      break;
      
    case 'ZPL':
      // Comandos ZPL para impressoras Zebra
      commands += '^XA\n'; // Início do rótulo
      commands += '^CF0,30\n'; // Fonte padrão, tamanho 30
      commands += '^FO50,50\n'; // Posição do campo
      commands += `^FD${normalizedContent}^FS\n`; // Dados do campo
      commands += '^XZ\n'; // Fim do rótulo
      break;
      
    case 'EPL':
      // Comandos EPL para impressoras Eltron
      commands += 'N\n'; // Limpar buffer
      commands += 'A50,50,0,3,1,1,N,"' + normalizedContent + '"\n'; // Texto
      commands += 'P1,1\n'; // Imprimir 1 cópia
      break;
      
    default:
      // Fallback para ESC/POS
      const ESC_DEFAULT = '\x1B';
      const GS_DEFAULT = '\x1D';
      
      commands += ESC_DEFAULT + '@';
      commands += ESC_DEFAULT + 't' + String.fromCharCode(16); // Codepage 860 (Português)
      commands += ESC_DEFAULT + 'a' + String.fromCharCode(1);
      commands += normalizedContent + '\n';
      commands += ESC_DEFAULT + 'd' + String.fromCharCode(3);
      commands += GS_DEFAULT + 'V' + String.fromCharCode(0);
  }
  
  return commands;
};

export const printData = async (
  content: string,
  settings: PrinterSettings = getDefaultPrinterSettings()
): Promise<{ success: boolean; message: string; details?: string }> => {
  return new Promise((resolve) => {
    try {
      console.log('=== INICIANDO CONEXÃO COM IMPRESSORA ===');
      console.log('IP:', settings.ipAddress);
      console.log('Porta:', settings.port);
      console.log('Padrão:', settings.printStandard);
      
      // Timeout para toda a operação
      const operationTimeout = setTimeout(() => {
        resolve({
          success: false,
          message: 'Timeout na operação de impressão',
          details: `Tempo limite de ${settings.timeout}s excedido`
        });
      }, settings.timeout * 1000);

      const client = TcpSocket.createConnection(
        {
          port: settings.port,
          host: settings.ipAddress
        },
        () => {
          console.log('✅ Conectado à impressora');
          
          try {
            // Gerar comandos baseados no padrão selecionado
            const printCommands = generatePrintCommands(settings, content);
            
            console.log('📤 Enviando dados para impressão...');
            console.log('Comandos gerados:', printCommands.length, 'bytes');
            
            // Enviar dados para impressora
            client.write(printCommands, 'utf8');
            
            // Aguardar um pouco antes de fechar a conexão
            setTimeout(() => {
              client.destroy();
              clearTimeout(operationTimeout);
              
              resolve({
                success: true,
                message: 'Dados enviados com sucesso!',
                details: `Impressão realizada via ${settings.printStandard}`
              });
            }, 1000);
            
          } catch (error) {
            console.error('❌ Erro ao enviar dados:', error);
            client.destroy();
            clearTimeout(operationTimeout);
            
            resolve({
              success: false,
              message: 'Erro ao processar dados de impressão',
              details: error instanceof Error ? error.message : 'Erro desconhecido'
            });
          }
        }
      );

      client.on('error', (error) => {
        console.info('❌ Erro de conexão:', error);
        clearTimeout(operationTimeout);
        
        let errorMessage = 'Erro de conexão com a impressora';
        let details = 'Erro desconhecido';
        
        // Verificar se error tem message
        const errorStr = error?.message || error?.toString() || 'Erro desconhecido';
        
        if (errorStr.includes('ECONNREFUSED')) {
          errorMessage = 'Impressora não encontrada';
          details = `Verifique se a impressora está ligada e acessível em ${settings.ipAddress}:${settings.port}`;
        } else if (errorStr.includes('ETIMEDOUT')) {
          errorMessage = 'Timeout de conexão';
          details = 'A impressora não respondeu no tempo esperado';
        } else if (errorStr.includes('EHOSTUNREACH')) {
          errorMessage = 'Host não alcançável';
          details = 'Verifique a configuração de rede e IP da impressora';
        } else {
          details = errorStr;
        }
        
        resolve({
          success: false,
          message: errorMessage,
          details: details
        });
      });

      client.on('timeout', () => {
        console.log('⏰ Timeout de conexão');
        client.destroy();
        clearTimeout(operationTimeout);
        
        resolve({
          success: false,
          message: 'Timeout de conexão',
          details: `Impressora não respondeu em ${settings.timeout}s`
        });
      });

      client.on('close', () => {
        console.log('🔌 Conexão fechada');
      });

    } catch (error) {
      console.error('❌ Erro geral:', error);
      resolve({
        success: false,
        message: 'Erro interno da aplicação',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  });
};

export const testPrint = async (settings: PrinterSettings): Promise<{ success: boolean; message: string; details?: string }> => {
  const testContent = `TESTE DE IMPRESSÃO
====================
Data: ${new Date().toLocaleDateString('pt-BR')}
Hora: ${new Date().toLocaleTimeString('pt-BR')}
IP: ${settings.ipAddress}
Porta: ${settings.port}
Padrão: ${settings.printStandard}
====================
Teste realizado com sucesso!`;

  return printData(testContent, settings);
};
