import { PrinterSettings, updateLastUsed } from './storage';
import TcpSocket from 'react-native-tcp-socket';

// Função para converter texto para Latin1 (ISO-8859-1) compatível com impressoras
const convertToLatin1 = (text: string): string => {
  // Simples conversão mantendo caracteres acentuados compatíveis
  const latin1Map: { [key: string]: string } = {
    // Usar caracteres que funcionam na maioria das impressoras ESC/POS
    'á': 'á', 'à': 'à', 'ã': 'ã', 'â': 'â', 'ä': 'ä',
    'é': 'é', 'è': 'è', 'ê': 'ê', 'ë': 'ë',
    'í': 'í', 'ì': 'ì', 'î': 'î', 'ï': 'ï',
    'ó': 'ó', 'ò': 'ò', 'õ': 'õ', 'ô': 'ô', 'ö': 'ö',
    'ú': 'ú', 'ù': 'ù', 'û': 'û', 'ü': 'ü',
    'ç': 'ç',
    'Á': 'Á', 'À': 'À', 'Ã': 'Ã', 'Â': 'Â', 'Ä': 'Ä',
    'É': 'É', 'È': 'È', 'Ê': 'Ê', 'Ë': 'Ë',
    'Í': 'Í', 'Ì': 'Ì', 'Î': 'Î', 'Ï': 'Ï',
    'Ó': 'Ó', 'Ò': 'Ò', 'Õ': 'Õ', 'Ô': 'Ô', 'Ö': 'Ö',
    'Ú': 'Ú', 'Ù': 'Ù', 'Û': 'Û', 'Ü': 'Ü',
    'Ç': 'Ç'
  };

  return text.replace(/[áàãâäéèêëíìîïóòõôöúùûüçÁÀÃÂÄÉÈÊËÍÌÎÏÓÒÕÔÖÚÙÛÜÇ]/g, (match) => {
    return latin1Map[match] || match;
  });
};

// Função para gerar comandos baseados no padrão de impressão
const generatePrintCommands = (settings: PrinterSettings, content: string): string => {
  let commands = '';
  
  // Converter o conteúdo para Latin1 para manter acentos corretos
  const convertedContent = convertToLatin1(content);
  
  switch (settings.printStandard) {
    case 'ESC/POS':
      const ESC = '\x1B';
      const GS = '\x1D';
      
      commands += ESC + '@'; // Inicializar impressora
      commands += ESC + 't' + String.fromCharCode(2); // Codepage 850 (Latin1)
      commands += ESC + 'a' + String.fromCharCode(1); // Centralizar
      commands += convertedContent + '\n';
      commands += ESC + 'd' + String.fromCharCode(3); // Alimentar papel
      commands += GS + 'V' + String.fromCharCode(0); // Corte completo
      break;
      
    case 'ZPL':
      // Comandos ZPL para impressoras Zebra
      commands += '^XA\n'; // Início do rótulo
      commands += '^CF0,30\n'; // Fonte padrão, tamanho 30
      commands += '^FO50,50\n'; // Posição do campo
      commands += `^FD${convertedContent}^FS\n`; // Dados do campo
      commands += '^XZ\n'; // Fim do rótulo
      break;
      
    case 'EPL':
      // Comandos EPL para impressoras Eltron
      commands += 'N\n'; // Limpar buffer
      commands += 'A50,50,0,3,1,1,N,"' + convertedContent + '"\n'; // Texto
      commands += 'P1,1\n'; // Imprimir 1 cópia
      break;
      
    default:
      // Fallback para ESC/POS
      const ESC_DEFAULT = '\x1B';
      const GS_DEFAULT = '\x1D';
      
      commands += ESC_DEFAULT + '@';
      commands += ESC_DEFAULT + 't' + String.fromCharCode(2); // Codepage 850 (Latin1)
      commands += ESC_DEFAULT + 'a' + String.fromCharCode(1);
      commands += convertedContent + '\n';
      commands += ESC_DEFAULT + 'd' + String.fromCharCode(3);
      commands += GS_DEFAULT + 'V' + String.fromCharCode(0);
  }
  
  return commands;
};

export const printData = async (
  content: string,
  settings: PrinterSettings,
  printerId?: string
): Promise<{ success: boolean; message: string; details?: string }> => {
  return new Promise(async (resolve) => {
    try {
      console.log('=== INICIANDO CONEXÃO COM IMPRESSORA ===');
      console.log('IP:', settings.ipAddress);
      console.log('Porta:', settings.port);
      console.log('Padrão:', settings.printStandard);
      
      // Atualizar último uso se printerId for fornecido
      if (printerId) {
        updateLastUsed(printerId).catch(e => console.warn('Erro ao atualizar último uso:', e));
      }
      
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
            
            // Enviar dados para impressora com codificação latin1
            client.write(printCommands, 'latin1');
            
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
  const testContent = `
 TESTE DE IMPRESSÃO
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
