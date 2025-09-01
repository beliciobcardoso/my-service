import {
  createResolver,
  createTcpClient,
  handleConnectionError,
  setupEventHandlers,
  sendPrintCommands,
  convertToLatin1,
  generatePrintCommands,
  type PrintResult
} from '../printer';
import { PrinterSettings } from '../storage';

// Mock do TcpSocket
jest.mock('react-native-tcp-socket', () => ({
  createConnection: jest.fn()
}));

// Mock do AsyncStorage para updateLastUsed
jest.mock('../storage', () => ({
  updateLastUsed: jest.fn().mockResolvedValue(undefined),
  PrinterSettings: {}
}));

// Mock das funções globais
const mockClearTimeout = jest.fn();
const mockSetTimeout = jest.fn((callback: Function) => {
  // Executa o callback imediatamente para simular comportamento síncrono nos testes
  callback();
  return {} as any;
}) as jest.Mock & { 
  __promisify__: <T = void>(delay?: number, value?: T, options?: any) => Promise<T> 
};

// Add __promisify__ property required by Node.js types
mockSetTimeout.__promisify__ = jest.fn() as unknown as <T = void>(delay?: number, value?: T, options?: any) => Promise<T>;

global.clearTimeout = mockClearTimeout;
global.setTimeout = mockSetTimeout;

describe('Printer Utils', () => {
  const mockSettings: PrinterSettings = {
    ipAddress: '192.168.1.100',
    port: 9100,
    printStandard: 'ESC/POS',
    timeout: 10
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createResolver', () => {
    it('deve resolver apenas uma vez', () => {
      const mockResolve = jest.fn();
      const resolveOnce = createResolver(mockResolve);

      const result: PrintResult = {
        success: true,
        message: 'Teste',
        details: 'Detalhes'
      };

      // Primeira chamada deve resolver
      resolveOnce(result);
      expect(mockResolve).toHaveBeenCalledTimes(1);
      expect(mockResolve).toHaveBeenCalledWith(result);

      // Segunda chamada deve ser ignorada
      resolveOnce({ success: false, message: 'Outro' });
      expect(mockResolve).toHaveBeenCalledTimes(1);
    });
  });

  describe('createTcpClient', () => {
    const mockTcpSocket = require('react-native-tcp-socket');

    it('deve criar cliente TCP com configurações corretas', () => {
      const mockClient = {
        setTimeout: jest.fn(),
        on: jest.fn()
      };

      mockTcpSocket.createConnection.mockReturnValue(mockClient);

      const client = createTcpClient(mockSettings);

      expect(mockTcpSocket.createConnection).toHaveBeenCalledWith({
        port: mockSettings.port,
        host: mockSettings.ipAddress
      }, expect.any(Function));

      expect(mockClient.setTimeout).toHaveBeenCalledWith(3000);
      expect(client).toBe(mockClient);
    });
  });

  describe('handleConnectionError', () => {
    it('deve retornar erro de impressora desligada para ECONNREFUSED', () => {
      const error = new Error('connect ECONNREFUSED 192.168.1.100:9100');
      const result = handleConnectionError(error, mockSettings);

      expect(result).toEqual({
        success: false,
        message: 'Impressora desligada',
        details: `A impressora em ${mockSettings.ipAddress}:${mockSettings.port} não está respondendo. Verifique se está ligada e conectada à rede.`
      });
    });

    it('deve retornar erro de timeout para ETIMEDOUT', () => {
      const error = new Error('connect ETIMEDOUT 192.168.1.100:9100');
      const result = handleConnectionError(error, mockSettings);

      expect(result).toEqual({
        success: false,
        message: 'Impressora não responde (timeout)',
        details: `A impressora em ${mockSettings.ipAddress}:${mockSettings.port} demorou muito para responder. Verifique se está ligada.`
      });
    });

    it('deve retornar erro de rede para ENETUNREACH', () => {
      const error = new Error('connect ENETUNREACH 192.168.1.100:9100');
      const result = handleConnectionError(error, mockSettings);

      expect(result).toEqual({
        success: false,
        message: 'Problema de rede',
        details: 'Não foi possível acessar a rede. Verifique sua conexão Wi-Fi.'
      });
    });

    it('deve retornar erro genérico para outros erros', () => {
      const error = new Error('Unknown error');
      const result = handleConnectionError(error, mockSettings);

      expect(result).toEqual({
        success: false,
        message: 'Impressora desligada',
        details: `A impressora em ${mockSettings.ipAddress}:${mockSettings.port} não está respondendo. Verifique se está ligada e conectada à rede.`
      });
    });
  });

  describe('setupEventHandlers', () => {
    it('deve configurar todos os event handlers', () => {
      const mockClient = {
        on: jest.fn(),
        destroy: jest.fn()
      };

      const mockResolveOnce = jest.fn();
      const mockTimeout = setTimeout(() => {}, 1000);
      const mockOnConnect = jest.fn();

      setupEventHandlers(mockClient, mockSettings, mockResolveOnce, mockTimeout, mockOnConnect);

      expect(mockClient.on).toHaveBeenCalledTimes(4);
      expect(mockClient.on).toHaveBeenCalledWith('error', expect.any(Function));
      expect(mockClient.on).toHaveBeenCalledWith('timeout', expect.any(Function));
      expect(mockClient.on).toHaveBeenCalledWith('connect', expect.any(Function));
      expect(mockClient.on).toHaveBeenCalledWith('close', expect.any(Function));
    });

    it('deve lidar com erro de conexão', () => {
      const mockClient = {
        on: jest.fn(),
        destroy: jest.fn()
      };

      const mockResolveOnce = jest.fn();
      const mockTimeout = setTimeout(() => {}, 1000);
      const mockOnConnect = jest.fn();

      setupEventHandlers(mockClient, mockSettings, mockResolveOnce, mockTimeout, mockOnConnect);

      // Simular erro
      const errorHandler = mockClient.on.mock.calls.find(call => call[0] === 'error')[1];
      const testError = new Error('Test error');

      errorHandler(testError);

      expect(mockClient.destroy).toHaveBeenCalled();
      expect(mockClearTimeout).toHaveBeenCalledWith(mockTimeout);
      expect(mockResolveOnce).toHaveBeenCalled();
    });

    it('deve lidar com timeout', () => {
      const mockClient = {
        on: jest.fn(),
        destroy: jest.fn()
      };

      const mockResolveOnce = jest.fn();
      const mockTimeout = setTimeout(() => {}, 1000);
      const mockOnConnect = jest.fn();

      setupEventHandlers(mockClient, mockSettings, mockResolveOnce, mockTimeout, mockOnConnect);

      // Simular timeout
      const timeoutHandler = mockClient.on.mock.calls.find(call => call[0] === 'timeout')[1];

      timeoutHandler();

      expect(mockClient.destroy).toHaveBeenCalled();
      expect(mockClearTimeout).toHaveBeenCalledWith(mockTimeout);
      expect(mockResolveOnce).toHaveBeenCalledWith({
        success: false,
        message: 'Impressora não responde',
        details: 'Timeout de conexão'
      });
    });

    it('deve chamar onConnect quando conectar', () => {
      const mockClient = {
        on: jest.fn(),
        destroy: jest.fn()
      };

      const mockResolveOnce = jest.fn();
      const mockTimeout = setTimeout(() => {}, 1000);
      const mockOnConnect = jest.fn();

      setupEventHandlers(mockClient, mockSettings, mockResolveOnce, mockTimeout, mockOnConnect);

      // Simular conexão
      const connectHandler = mockClient.on.mock.calls.find(call => call[0] === 'connect')[1];

      connectHandler();

      expect(mockOnConnect).toHaveBeenCalled();
    });
  });

  describe('sendPrintCommands', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('deve enviar comandos com sucesso', async () => {
      const mockClient = {
        write: jest.fn((data, encoding, callback) => {
          callback(null); // Sucesso
          return true;
        }),
        destroy: jest.fn()
      };

      const mockResolveOnce = jest.fn();
      const mockTimeout = setTimeout(() => {}, 1000);
      const commands = 'test commands';

      await sendPrintCommands(mockClient, commands, mockSettings, mockResolveOnce, mockTimeout);

      expect(mockClient.write).toHaveBeenCalledWith(commands, 'latin1', expect.any(Function));

      // Avançar timers para simular o setTimeout
      jest.advanceTimersByTime(1000);

      expect(mockClient.destroy).toHaveBeenCalled();
      expect(mockResolveOnce).toHaveBeenCalledWith({
        success: true,
        message: 'Dados enviados com sucesso!',
        details: 'Impressão enviada com sucesso'
      });
    });

    it('deve lidar com erro no envio', async () => {
      const mockClient = {
        write: jest.fn((data, encoding, callback) => {
          callback(new Error('Write error'));
          return true;
        }),
        destroy: jest.fn()
      };

      const mockResolveOnce = jest.fn();
      const mockTimeout = setTimeout(() => {}, 1000);
      const commands = 'test commands';

      await sendPrintCommands(mockClient, commands, mockSettings, mockResolveOnce, mockTimeout);

      expect(mockClient.destroy).toHaveBeenCalled();
      expect(mockResolveOnce).toHaveBeenCalledWith({
        success: false,
        message: 'Erro ao enviar dados para impressora',
        details: 'Write error'
      });
    });

    it('deve lidar com falha no write', async () => {
      const mockClient = {
        write: jest.fn(() => false), // Falha no write
        destroy: jest.fn()
      };

      const mockResolveOnce = jest.fn();
      const mockTimeout = setTimeout(() => {}, 1000);
      const commands = 'test commands';

      await sendPrintCommands(mockClient, commands, mockSettings, mockResolveOnce, mockTimeout);

      expect(mockClient.destroy).toHaveBeenCalled();
      expect(mockResolveOnce).toHaveBeenCalledWith({
        success: false,
        message: 'Falha ao enviar dados',
        details: 'A impressora não conseguiu receber os dados'
      });
    });
  });

  describe('convertToLatin1', () => {
    it('deve converter caracteres acentuados para Latin1', () => {
      const input = 'Olá, como você está? Café naïve résumé';
      const expected = 'Olá, como você está? Café naïve résumé';

      const result = convertToLatin1(input);
      expect(result).toBe(expected);
    });

    it('deve manter caracteres não acentuados inalterados', () => {
      const input = 'Hello World 123!@#';
      const result = convertToLatin1(input);
      expect(result).toBe(input);
    });

    it('deve lidar com string vazia', () => {
      const result = convertToLatin1('');
      expect(result).toBe('');
    });
  });

  describe('generatePrintCommands', () => {
    it('deve gerar comandos ESC/POS', () => {
      const content = 'Teste de impressão';
      const result = generatePrintCommands(mockSettings, content);

      expect(result).toContain('\x1B@'); // Inicialização
      expect(result).toContain('\x1Bt\x02'); // Codepage 850
      expect(result).toContain('\x1Ba\x01'); // Centralizar
      expect(result).toContain(content);
      expect(result).toContain('\x1Bd\x03'); // Alimentar papel
      expect(result).toContain('\x1DV\x00'); // Corte
    });

    it('deve gerar comandos ZPL', () => {
      const zplSettings = { ...mockSettings, printStandard: 'ZPL' as const };
      const content = 'Teste ZPL';
      const result = generatePrintCommands(zplSettings, content);

      expect(result).toContain('^XA'); // Início
      expect(result).toContain('^CF0,30'); // Fonte
      expect(result).toContain('^FO50,50'); // Posição
      expect(result).toContain(`^FD${content}^FS`); // Dados
      expect(result).toContain('^XZ'); // Fim
    });

    it('deve gerar comandos EPL', () => {
      const eplSettings = { ...mockSettings, printStandard: 'EPL' as const };
      const content = 'Teste EPL';
      const result = generatePrintCommands(eplSettings, content);

      expect(result).toContain('N'); // Limpar buffer
      expect(result).toContain('A50,50,0,3,1,1,N,'); // Texto
      expect(result).toContain('P1,1'); // Imprimir
    });

    it('deve usar ESC/POS como fallback', () => {
      const unknownSettings = { ...mockSettings, printStandard: 'UNKNOWN' as any };
      const content = 'Teste fallback';
      const result = generatePrintCommands(unknownSettings, content);

      expect(result).toContain('\x1B@'); // ESC/POS fallback
    });
  });
});
