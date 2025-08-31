# Documentação Completa - Sistema de Impressão React Native

## 1. LEVANTAMENTO DE REQUISITOS

### 1.1. Requisitos Funcionais
- **RF01**: Permitir entrada de dados (Nome e Código) na tela principal
- **RF02**: Configurar impressora via IP, porta e padrão de impressão
- **RF03**: Persistir configurações da impressora localmente
- **RF04**: Realizar impressão em rede via TCP/IP
- **RF05**: Testar conectividade com a impressora
- **RF06**: Suportar múltiplos padrões de impressão (ESC/POS, ZPL, EPL)

### 1.2. Requisitos Não-Funcionais
- **RNF01**: Interface responsiva e intuitiva
- **RNF02**: Compatibilidade com Android e iOS
- **RNF03**: Suporte a Expo Router para navegação
- **RNF04**: Tratamento robusto de erros de rede
- **RNF05**: Timeout configurável para conexões TCP

### 1.3. Casos de Uso

#### UC01: Imprimir Dados
- **Ator**: Usuário
- **Pré-condição**: Impressora configurada
- **Fluxo Principal**: 
  1. Usuário insere nome e código
  2. Sistema valida dados
  3. Sistema envia dados formatados para impressora
  4. Sistema confirma sucesso da operação

#### UC02: Configurar Impressora
- **Ator**: Usuário
- **Fluxo Principal**:
  1. Usuário acessa configurações
  2. Insere IP, porta, padrão e timeout
  3. Sistema valida configurações
  4. Sistema persiste dados localmente

#### UC03: Testar Conectividade
- **Ator**: Usuário
- **Pré-condição**: Configurações preenchidas
- **Fluxo Principal**:
  1. Sistema estabelece conexão TCP
  2. Envia documento de teste
  3. Retorna status da operação

## 2. ARQUITETURA DO SISTEMA

### 2.1. Arquitetura Geral
```
┌──────────────────┐    ┌──────────────────┐    ┌────────────────────┐
│  Tela Principal  │◄──►│     Navegação    │◄──►│ Tela Configurações │
│   (index.tsx)    │    │   (Expo Router)  │    │   (settings.tsx)   │
└──────────────────┘    └──────────────────┘    └────────────────────┘
         │                                               │
         ▼                                               ▼
┌─────────────────┐                              ┌─────────────────┐
│ Utils Impressão │                              │ Utils Storage   │
│ (printer.ts)    │                              │ (storage.ts)    │
└─────────────────┘                              └─────────────────┘
         │
         ▼
┌─────────────────┐
│ TCP/IP Socket   │
│ (Impressora)    │
└─────────────────┘
```

### 2.2. Componentes Principais

#### 2.2.1. Tela Principal (`src/app/index.tsx`)
- Campos de entrada (Nome, Código)
- Botão de confirmação e impressão
- Navegação para configurações
- Validação de dados de entrada

#### 2.2.2. Tela de Configurações (`src/app/settings.tsx`)
- Configuração de IP da impressora
- Configuração de porta TCP
- Seleção do padrão de impressão
- Configuração de timeout
- Teste de conectividade
- Persistência de configurações

#### 2.2.3. Utilitários de Impressão (`src/utils/printer.ts`)
- Conexão TCP/IP com impressora
- Geração de comandos ESC/POS, ZPL e EPL
- Tratamento de erros de rede
- Sistema de timeout configurável

#### 2.2.4. Utilitários de Armazenamento (`src/utils/storage.ts`)
- Persistência via AsyncStorage
- Interface de configurações tipada
- Configurações padrão
- Tratamento de erros de I/O

## 3. DEPENDÊNCIAS E TECNOLOGIAS

### 3.1. Dependências Principais
```json
{
  "react-native-tcp-socket": "^6.0.6",
  "@react-native-async-storage/async-storage": "^2.1.2",
  "@react-native-picker/picker": "^2.8.1",
  "@expo/vector-icons": "^14.0.4",
  "expo-router": "^3.5.23"
}
```

### 3.2. Justificativas Técnicas
- **react-native-tcp-socket**: Comunicação TCP/IP direta com impressoras
- **@react-native-async-storage/async-storage**: Armazenamento local de configurações
- **@react-native-picker/picker**: Seleção de padrões de impressão
- **expo-router**: Navegação baseada em arquivos

## 4. IMPLEMENTAÇÃO

### 4.1. Estrutura de Dados

#### Interface de Configurações da Impressora
```typescript
export interface PrinterSettings {
  ipAddress: string;
  port: number;
  printStandard: string;
  timeout: number;
}
```

### 4.2. Padrões de Impressão Suportados

#### ESC/POS (Padrão)
- Inicialização da impressora: `\x1B@`
- Codepage 437: `\x1Bt\x00`
- Centralização: `\x1Ba\x01`
- Alimentação de papel: `\x1Bd\x03`
- Corte: `\x1DV\x00`

#### ZPL (Zebra)
- Início do rótulo: `^XA`
- Configuração de fonte: `^CF0,30`
- Posicionamento: `^FO50,50`
- Dados do campo: `^FD{conteúdo}^FS`
- Fim do rótulo: `^XZ`

#### EPL (Eltron)
- Limpar buffer: `N`
- Texto: `A50,50,0,3,1,1,N,"{conteúdo}"`
- Impressão: `P1,1`

### 4.3. Fluxo de Conexão TCP/IP
```typescript
1. TcpSocket.createConnection({ port, host })
2. Geração de comandos baseada no padrão
3. client.write(comandos, 'utf8')
4. Tratamento de eventos (connect, error, timeout)
5. Fechamento da conexão
```

## 5. CONFIGURAÇÃO E EXECUÇÃO

### 5.1. Configuração do Projeto
```bash
# Instalação de dependências
npm install

# Configuração do ambiente
npx expo install --fix

# Execução em desenvolvimento
npm start
```

### 5.2. Build de Produção
```bash
# Development Build para Android
npx expo run:android

# Development Build para iOS  
npx expo run:ios
```

### 5.3. Configurações Necessárias (`app.json`)
```json
{
  "expo": {
    "android": {
      "package": "com.belloinfo.myservice"
    },
    "ios": {
      "bundleIdentifier": "com.belloinfo.myservice"
    }
  }
}
```

## 6. USABILIDADE

### 6.1. Interface do Usuário
- **Design responsivo** com StyleSheet otimizado
- **Feedback visual** para ações do usuário
- **Validação em tempo real** de campos obrigatórios
- **Mensagens de erro claras** e acionáveis

### 6.2. Fluxo de Navegação
1. **Tela Principal**: Entrada de dados e impressão
2. **Configurações**: Acesso via ícone no header
3. **Teste de Impressão**: Validação de conectividade
4. **Retorno**: Navegação intuitiva entre telas

### 6.3. Tratamento de Erros
```typescript
// Exemplos de erros tratados:
- ECONNREFUSED: "Impressora não encontrada"
- ETIMEDOUT: "Timeout de conexão"  
- EHOSTUNREACH: "Host não alcançável"
- Dados inválidos: "Verifique os campos obrigatórios"
```

## 7. TESTES E VALIDAÇÃO

### 7.1. Cenários de Teste
- **Teste de Conectividade**: Impressora ligada/desligada
- **Validação de IP**: Formatos válidos/inválidos
- **Timeout**: Comportamento com diferentes tempos
- **Padrões de Impressão**: ESC/POS, ZPL, EPL
- **Persistência**: Salvar/carregar configurações

### 7.2. Logs de Depuração
O sistema implementa logging abrangente:
```typescript
console.log('=== INICIANDO CONEXÃO COM IMPRESSORA ===');
console.log('IP:', settings.ipAddress);
console.log('Porta:', settings.port);
console.log('📤 Enviando dados para impressão...');
```

## 8. STATUS DO PROJETO

### 8.1. Funcionalidades Implementadas ✅
- [x] Tela principal com entrada de dados
- [x] Tela de configurações completa  
- [x] Conexão TCP/IP real com impressoras
- [x] Suporte a múltiplos padrões (ESC/POS, ZPL, EPL)
- [x] Persistência de configurações
- [x] Teste de conectividade
- [x] Tratamento robusto de erros
- [x] Navegação com Expo Router
- [x] Interface responsiva e intuitiva

### 8.2. Ambiente de Execução
- **Modo Development Build**: Para acesso completo às APIs nativas
- **Compatibilidade**: Android e iOS
- **Rede**: Comunicação TCP/IP direta com impressoras
- **Performance**: Otimizado para uso em produção

## 9. CONSIDERAÇÕES FINAIS

O sistema está **100% funcional** e pronto para uso em ambiente de produção. A arquitetura modular permite fácil manutenção e extensão de funcionalidades. O uso do Expo Router e bibliotecas nativas garante performance e compatibilidade multiplataforma.

**Próximos Passos Sugeridos**:
- Implementar cache de configurações múltiplas
- Adicionar histórico de impressões
- Implementar configuração via QR Code
- Adicionar suporte a templates de impressão
