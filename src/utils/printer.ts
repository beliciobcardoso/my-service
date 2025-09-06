import { PrinterSettings, updateLastUsed, addPrintHistoryEntry } from './storage';
import TcpSocket from 'react-native-tcp-socket';

// Tipo para resultado de impressão
type PrintResult = { success: boolean; message: string; details?: string };

// Sistema de logs configurável
const DEBUG = __DEV__; // Ativo apenas em desenvolvimento
const log = (message: string, ...args: any[]) => {
  if (DEBUG) console.log(message, ...args);
};
const logError = (message: string, ...args: any[]) => {
  if (DEBUG) console.error(message, ...args);
};

// Função auxiliar para resolver promise apenas uma vez
const createResolver = (resolve: (result: PrintResult) => void) => {
  let resolved = false;
  return (result: PrintResult) => {
    if (resolved) return;
    resolved = true;
    log('🎯 Resultado final:', result.message);
    resolve(result);
  };
};

// Criar cliente TCP com configurações básicas
const createTcpClient = (settings: PrinterSettings) => {
  log('🔌 Criando conexão TCP...');
  const client = TcpSocket.createConnection({
    port: settings.port,
    host: settings.ipAddress
  }, () => {
    // Callback não utilizado - lógica movida para event handlers
  });

  client.setTimeout(3000); // 3 segundos para timeout de conexão
  log('⏰ Timeout de conexão configurado: 3 segundos');

  return client;
};

// Centralizar tratamento de erros de conexão
const handleConnectionError = (
  error: any, 
  settings: PrinterSettings, 
  printerId?: string,
  printerName?: string,
  labelData?: { nome: string; codigo: string },
  startTime?: number
): PrintResult => {
  logError('❌ Erro de conexão capturado:', error);

  const errorStr = error?.message || error?.toString() || 'Erro desconhecido';
  log('🔍 Tipo de erro:', errorStr);

  let result: PrintResult;

  // Timeout específico
  if (errorStr.includes('ETIMEDOUT') || errorStr.includes('timeout')) {
    result = {
      success: false,
      message: 'Impressora não responde (timeout)',
      details: `A impressora em ${settings.ipAddress}:${settings.port} demorou muito para responder. Verifique se está ligada.`
    };
  }
  // Problema de rede
  else if (errorStr.includes('ENETUNREACH') || errorStr.includes('Network unreachable')) {
    result = {
      success: false,
      message: 'Problema de rede',
      details: 'Não foi possível acessar a rede. Verifique sua conexão Wi-Fi.'
    };
  }
  // Qualquer outro erro = impressora desligada
  else {
    result = {
      success: false,
      message: 'Impressora desligada',
      details: `A impressora em ${settings.ipAddress}:${settings.port} não está respondendo. Verifique se está ligada e conectada à rede.`
    };
  }

  // Registrar erro de conexão no histórico
  if (labelData && startTime) {
    addPrintHistoryEntry({
      printerName: printerName || `Impressora ${settings.ipAddress}`,
      printerId: printerId || 'unknown',
      printerIp: settings.ipAddress,
      printStandard: settings.printStandard,
      nome: labelData.nome,
      codigo: labelData.codigo,
      status: 'error',
      errorMessage: result.message,
      duration: Date.now() - startTime
    }).catch(e => logError('Erro ao registrar histórico de falha de conexão:', e));
  }

  return result;
};

// Configurar todos os event handlers do cliente
const setupEventHandlers = (
  client: any,
  settings: PrinterSettings,
  resolveOnce: (result: PrintResult) => void,
  operationTimeout: ReturnType<typeof setTimeout>,
  onConnect: () => void,
  printerId?: string,
  printerName?: string,
  labelData?: { nome: string; codigo: string },
  startTime?: number
) => {
  // Handler de erro (sempre primeiro)
  client.on('error', (error: any) => {
    client.destroy();
    clearTimeout(operationTimeout);
    const result = handleConnectionError(error, settings, printerId, printerName, labelData, startTime);
    resolveOnce(result);
  });

  // Handler de timeout
  client.on('timeout', () => {
    log('⏰ Timeout de conexão');
    client.destroy();
    clearTimeout(operationTimeout);
    
    // Registrar timeout no histórico
    if (labelData && startTime) {
      addPrintHistoryEntry({
        printerName: printerName || `Impressora ${settings.ipAddress}`,
        printerId: printerId || 'unknown',
        printerIp: settings.ipAddress,
        printStandard: settings.printStandard,
        nome: labelData.nome,
        codigo: labelData.codigo,
        status: 'timeout',
        errorMessage: 'Timeout de conexão',
        duration: Date.now() - startTime
      }).catch(e => logError('Erro ao registrar histórico de timeout de conexão:', e));
    }
    
    resolveOnce({
      success: false,
      message: 'Impressora não responde',
      details: 'Timeout de conexão'
    });
  });

  // Handler de conexão bem-sucedida
  client.on('connect', () => {
    log('✅ Conectado à impressora com sucesso!');
    onConnect();
  });

  // Handler de fechamento
  client.on('close', () => {
    log('🔌 Conexão fechada');
  });
};

// Enviar comandos de impressão para a impressora
const sendPrintCommands = async (
  client: any,
  commands: string,
  settings: PrinterSettings,
  resolveOnce: (result: PrintResult) => void,
  operationTimeout: ReturnType<typeof setTimeout>,
  printerId?: string,
  printerName?: string,
  labelData?: { nome: string; codigo: string },
  startTime?: number
) => {
  try {
    log('📤 Enviando dados para impressão...');
    log('Comandos gerados:', commands.length, 'bytes');

    const writeResult = client.write(commands, 'latin1', (error: any) => {
      if (error) {
        logError('❌ Erro ao enviar dados:', error);
        client.destroy();
        clearTimeout(operationTimeout);
        
        // Registrar erro no histórico
        if (labelData && startTime) {
          addPrintHistoryEntry({
            printerName: printerName || `Impressora ${settings.ipAddress}`,
            printerId: printerId || 'unknown',
            printerIp: settings.ipAddress,
            printStandard: settings.printStandard,
            nome: labelData.nome,
            codigo: labelData.codigo,
            status: 'error',
            errorMessage: error.message || 'Falha na transmissão',
            duration: Date.now() - startTime
          });
        }
        
        resolveOnce({
          success: false,
          message: 'Erro ao enviar dados para impressora',
          details: error.message || 'Falha na transmissão'
        });
        return;
      }

      log('✅ Dados enviados com sucesso');

      // Aguardar um pouco antes de confirmar sucesso
      setTimeout(() => {
        client.destroy();
        clearTimeout(operationTimeout);
        
        // Registrar sucesso no histórico
        if (labelData && startTime) {
          addPrintHistoryEntry({
            printerName: printerName || `Impressora ${settings.ipAddress}`,
            printerId: printerId || 'unknown',
            printerIp: settings.ipAddress,
            printStandard: settings.printStandard,
            nome: labelData.nome,
            codigo: labelData.codigo,
            status: 'success',
            duration: Date.now() - startTime
          });
        }
        
        resolveOnce({
          success: true,
          message: 'Dados enviados com sucesso!',
          details: 'Impressão enviada com sucesso'
        });
      }, 1000); // Reduzido para 1 segundo
    });

    // Verificar se write foi bem-sucedido
    if (!writeResult) {
      client.destroy();
      clearTimeout(operationTimeout);
      
      // Registrar erro no histórico
      if (labelData && startTime) {
        addPrintHistoryEntry({
          printerName: printerName || `Impressora ${settings.ipAddress}`,
          printerId: printerId || 'unknown',
          printerIp: settings.ipAddress,
          printStandard: settings.printStandard,
          nome: labelData.nome,
          codigo: labelData.codigo,
          status: 'error',
          errorMessage: 'Falha ao enviar dados para a impressora',
          duration: Date.now() - startTime
        });
      }
      
      resolveOnce({
        success: false,
        message: 'Falha ao enviar dados',
        details: 'A impressora não conseguiu receber os dados'
      });
    }

  } catch (error) {
    logError('❌ Erro ao processar dados:', error);
    client.destroy();
    clearTimeout(operationTimeout);
    
    // Registrar erro no histórico
    if (labelData && startTime) {
      addPrintHistoryEntry({
        printerName: printerName || `Impressora ${settings.ipAddress}`,
        printerId: printerId || 'unknown',
        printerIp: settings.ipAddress,
        printStandard: settings.printStandard,
        nome: labelData.nome,
        codigo: labelData.codigo,
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Erro ao processar dados',
        duration: Date.now() - startTime
      });
    }
    
    resolveOnce({
      success: false,
      message: 'Erro ao processar dados de impressão',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};

/**
 * Converte texto para codificação Latin1 compatível com impressoras
 * @param text Texto a ser convertido
 * @returns Texto convertido para Latin1
 */
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

/**
 * Gera comandos de impressão baseados no padrão da impressora
 * @param settings Configurações da impressora
 * @param content Conteúdo a ser impresso
 * @returns String com comandos de impressão
 */
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
      commands += GS + '!' + String.fromCharCode(settings.fontSize || 0x00); // Tamanho da fonte configurável
      commands += ESC + 'a' + String.fromCharCode(1); // Centralizar
      commands += convertedContent + '\n';
      commands += ESC + 'd' + String.fromCharCode(3); // Alimentar papel
      commands += GS + 'V' + String.fromCharCode(0); // Corte completo
      break;
      
    case 'ZPL':
      // Comandos ZPL para impressoras Zebra
      commands += '^XA\n'; // Início do rótulo
      commands += '^CF0,50\n'; // Fonte padrão, tamanho 50 (aumentado de 30)
      commands += '^FO50,50\n'; // Posição do campo
      commands += `^FD${convertedContent}^FS\n`; // Dados do campo
      commands += '^XZ\n'; // Fim do rótulo
      break;
      
    case 'EPL':
      // Comandos EPL para impressoras Eltron
      commands += 'N\n'; // Limpar buffer
      commands += 'A50,50,0,4,1,1,N,"' + convertedContent + '"\n'; // Texto com fonte tamanho 4 (aumentado de 3)
      commands += 'P1,1\n'; // Imprimir 1 cópia
      break;
      
    default:
      // Fallback para ESC/POS
      const ESC_DEFAULT = '\x1B';
      const GS_DEFAULT = '\x1D';
      
      commands += ESC_DEFAULT + '@';
      commands += ESC_DEFAULT + 't' + String.fromCharCode(2); // Codepage 850 (Latin1)
      commands += GS_DEFAULT + '!' + String.fromCharCode(settings.fontSize || 0x00); // Tamanho da fonte configurável
      commands += ESC_DEFAULT + 'a' + String.fromCharCode(1);
      commands += convertedContent + '\n';
      commands += ESC_DEFAULT + 'd' + String.fromCharCode(3);
      commands += GS_DEFAULT + 'V' + String.fromCharCode(0);
  }
  
  return commands;
};

// Exportar funções auxiliares para testes
export {
  createResolver,
  createTcpClient,
  handleConnectionError,
  setupEventHandlers,
  sendPrintCommands,
  convertToLatin1,
  generatePrintCommands,
  type PrintResult
};

/**
 * Envia dados para impressão em uma impressora de rede
 * @param content Conteúdo a ser impresso
 * @param settings Configurações da impressora (IP, porta, padrão)
 * @param printerId ID opcional da impressora para rastreamento de uso
 * @returns Promise com resultado da operação de impressão
 */
export const printData = async (
  content: string,
  settings: PrinterSettings,
  printerId?: string,
  printerName?: string,
  labelData?: { nome: string; codigo: string }
): Promise<PrintResult> => {
  const startTime = Date.now();
  return new Promise((resolve) => {
    const resolveOnce = createResolver(resolve);

    try {
      // Logs iniciais
      log('=== INICIANDO CONEXÃO COM IMPRESSORA ===');
      log('IP:', settings.ipAddress);
      log('Porta:', settings.port);
      log('Padrão:', settings.printStandard);

      // Atualizar último uso se printerId fornecido
      if (printerId) {
        updateLastUsed(printerId).catch(e => logError('Erro ao atualizar último uso:', e));
      }

      // Timeout para toda a operação
      const operationTimeout = setTimeout(() => {
        log('⏰ Timeout geral da operação');
        
        // Registrar timeout no histórico
        if (labelData) {
          addPrintHistoryEntry({
            printerName: printerName || `Impressora ${settings.ipAddress}`,
            printerId: printerId || 'unknown',
            printerIp: settings.ipAddress,
            printStandard: settings.printStandard,
            nome: labelData.nome,
            codigo: labelData.codigo,
            status: 'timeout',
            errorMessage: 'Operação expirou por timeout',
            duration: Date.now() - startTime
          }).catch(e => logError('Erro ao registrar histórico de timeout geral:', e));
        }
        
        resolveOnce({
          success: false,
          message: 'Timeout na operação de impressão',
          details: `Tempo limite de ${settings.timeout}s excedido`
        });
      }, settings.timeout * 1000);

      // Criar cliente TCP
      const client = createTcpClient(settings);

      // Configurar event handlers
      setupEventHandlers(client, settings, resolveOnce, operationTimeout, () => {
        // Callback executado quando conectar com sucesso
        const commands = generatePrintCommands(settings, content);
        sendPrintCommands(client, commands, settings, resolveOnce, operationTimeout, printerId, printerName, labelData, startTime);
      }, printerId, printerName, labelData, startTime);

    } catch (error) {
      logError('❌ Erro geral:', error);
      
      // Registrar erro crítico no histórico
      if (labelData) {
        addPrintHistoryEntry({
          printerName: printerName || `Impressora ${settings.ipAddress}`,
          printerId: printerId || 'unknown',
          printerIp: settings.ipAddress,
          printStandard: settings.printStandard,
          nome: labelData.nome,
          codigo: labelData.codigo,
          status: 'error',
          errorMessage: error instanceof Error ? error.message : 'Erro crítico desconhecido',
          duration: Date.now() - startTime
        }).catch(e => logError('Erro ao registrar histórico de erro crítico:', e));
      }
      
      resolveOnce({
        success: false,
        message: 'Erro interno da aplicação',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  });
};

/**
 * Testa a conexão com uma impressora enviando dados de teste
 * @param settings Configurações da impressora para teste
 * @returns Promise com resultado do teste de impressão
 */
export const testPrint = async (settings: PrinterSettings): Promise<PrintResult> => {
  const testContent = `
TESTE DE IMPRESSÃO
====================
Data: ${new Date().toLocaleDateString('pt-BR')}
Hora: ${new Date().toLocaleTimeString('pt-BR')}
IP: ${settings.ipAddress}
Porta: ${settings.port}
Padrão: ${settings.printStandard}
====================
Teste realizado com sucesso!
`;

  return printData(testContent, settings);
};
