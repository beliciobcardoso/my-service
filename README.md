# Aplicativo de Impressão de Etiquetas

Este é um aplicativo React Native desenvolvido com Expo (Development Build) para impressão real de etiquetas em impressoras de rede ESC/POS, ZPL e EPL com suporte completo a múltiplas configurações de impressora e comunicação TCP/IP direta.

## 🚀 Funcionalidades

- **Tela Principal**: Interface para inserir nome e código e imprimir etiquetas
- **Sistema de Cache Múltiplo**: Gerencie múltiplas configurações de impressora salvas
- **Configurações da Impressora**: Tela para configurar IP, porta e padrão de impressão
- **Gerenciamento de Impressoras**: Adicione, edite, exclua e defina impressoras padrão
- **Teste de Impressão**: Funcionalidade para testar a conectividade com a impressora
- **Armazenamento Local**: As configurações da impressora são salvas localmente
- **Testes Unitários**: Cobertura completa de testes para funções auxiliares (20/20 passando)
- **Impressão Real**: Comunicação TCP/IP direta com impressoras físicas
- **Múltiplos Padrões**: Suporte completo para ESC/POS, ZPL e EPL

## 📱 Uso do Aplicativo

### Primeira Configuração

1. Abra o aplicativo
2. Toque em "Configurações" na tela principal
3. Configure os dados da impressora:
   - **IP da Impressora**: Digite o endereço IP da impressora na rede (ex: 192.168.1.100)
   - **Porta**: Digite a porta de comunicação (padrão: 9100)
   - **Padrão**: Selecione o padrão de impressão (ESC/POS, ZPL, EPL)
4. Toque em "Salvar Configurações"
5. Use "Testar Impressão" para verificar se a impressora responde

### Gerenciando Múltiplas Impressoras

1. Toque no ícone de impressora no canto superior direito da tela principal
2. Visualize todas as impressoras salvas
3. **Adicionar Impressora**: Toque em "Adicionar Impressora" para criar uma nova configuração
4. **Editar Impressora**: Toque no ícone de edição ao lado de uma impressora para modificá-la
5. **Definir como Padrão**: Toque na estrela para definir uma impressora como padrão
6. **Excluir Impressora**: Toque no ícone de lixeira para remover uma configuração

### Imprimindo Etiquetas

1. Na tela principal, digite:
   - **Nome**: Nome que será impresso na etiqueta
   - **Código**: Código que será impresso na etiqueta
2. Toque em "Confirmar e Imprimir"
3. A etiqueta será enviada para a impressora configurada como padrão

## 🛠️ Instalação e Desenvolvimento

### Pré-requisitos

- Node.js (versão 16 ou superior)
- npm ou yarn
- Expo CLI instalado globalmente
- Android Studio (para Android) ou Xcode (para iOS) - **Development Build necessário**
- Dispositivo físico ou emulador para teste

### Instalação

1. Clone o repositório:
\`\`\`bash
git clone <url-do-repositorio>
cd my-service
\`\`\`

2. Instale as dependências:
\`\`\`bash
npm install
\`\`\`

3. Execute um Development Build:

**Para Android:**
\`\`\`bash
npx expo run:android
\`\`\`

**Para iOS:**
\`\`\`bash
npx expo run:ios
\`\`\`

4. O aplicativo será compilado e instalado no dispositivo/emulador

> **Nota**: Este projeto requer Development Build devido ao uso de bibliotecas nativas como `react-native-tcp-socket` para comunicação TCP/IP real com impressoras.

## 🧪 Testes

O projeto inclui uma suíte completa de testes unitários para validar as funcionalidades críticas:

```bash
# Executar todos os testes
npm test

# Executar testes com watch mode
npm run test:watch

# Executar testes com coverage
npm run test:coverage
```

**Status dos Testes**: ✅ 20/20 testes passando
- Validação de funções de impressão
- Testes de conectividade TCP/IP
- Validação de formatos de dados
- Tratamento de erros de rede

## 🔧 Dependências Principais

- **expo-router**: Sistema de navegação baseado em arquivos do Expo
- **@react-native-async-storage/async-storage**: Armazenamento local das configurações
- **react-native-tcp-socket**: Comunicação TCP/IP real com impressoras
- **@react-native-picker/picker**: Seletor de padrões de impressão
- **@expo/vector-icons**: Ícones para interface do usuário
- **jest**: Framework de testes unitários

## 📋 Estrutura do Projeto

\`\`\`
src/
├── app/
│   ├── _layout.tsx        # Layout raiz com Stack Navigator
│   ├── index.tsx          # Tela principal
│   ├── settings.tsx       # Tela de configurações (criar/editar)
│   └── printers.tsx       # Tela de gerenciamento de impressoras
├── utils/
│   ├── storage.ts         # Funções de armazenamento e cache múltiplo
│   ├── printer.ts         # Funções de impressão
│   └── __tests__/
│       └── printer.test.ts # Testes unitários (20 testes passando)
└── components/
    ├── Button/
    │   ├── index.tsx
    │   └── styles.ts
    └── Input/
        ├── index.tsx
        └── styles.ts
```

## ⚠️ Notas Importantes

### Sobre a Impressão

Este aplicativo implementa **impressão REAL** através de comunicação TCP/IP direta com impressoras. As funcionalidades incluem:

- ✅ **Conexão TCP/IP nativa** com impressoras de rede
- ✅ **Suporte completo** aos padrões ESC/POS, ZPL e EPL  
- ✅ **Teste de conectividade** em tempo real
- ✅ **Tratamento robusto** de erros de rede e timeout
- ✅ **Development Build** necessário para bibliotecas nativas

### Bibliotecas de Impressão Utilizadas

- **react-native-tcp-socket**: Comunicação TCP/IP direta com impressoras
- **Comandos ESC/POS**: Para impressoras térmicas padrão
- **Comandos ZPL**: Para impressoras Zebra
- **Comandos EPL**: Para impressoras Eltron

### Conexão de Rede

- A impressora deve estar na **mesma rede Wi-Fi** que o celular
- Certifique-se de que a impressora aceita conexões TCP/IP
- A porta padrão para impressoras ESC/POS é **9100**
- Verifique o IP da impressora no painel de configurações da mesma

## 🐛 Resolução de Problemas

### Erro de Conexão
- Verifique se o IP e porta estão corretos
- Teste a conectividade via ping no IP da impressora
- Certifique-se de que não há firewall bloqueando a conexão

### Problemas de Development Build
- Execute `npx expo doctor` para verificar problemas de ambiente
- Certifique-se de que Android Studio/Xcode estão configurados corretamente
- Limpe o cache: `npx expo start --clear`

## 🎯 Recursos Implementados

### ✅ **Funcionalidades Avançadas Implementadas**

- **Sistema de Cache Múltiplo**: Implementação completa de gerenciamento de múltiplas configurações de impressora
- **Tela de Gerenciamento**: Nova tela `printers.tsx` para visualizar, editar e excluir impressoras salvas
- **Edição de Impressoras**: Funcionalidade completa para editar configurações existentes
- **Testes Unitários**: Suíte completa com 20 testes passando para validação de funcionalidades
- **Impressão Real TCP/IP**: Comunicação direta com impressoras via rede
- **Interface Melhorada**: Botões de ação intuitivos e navegação fluida entre telas
- **Múltiplos Padrões**: Suporte completo ESC/POS, ZPL e EPL
- **Tratamento de Erros**: Sistema robusto de tratamento de falhas de rede

### ✅ **Correções Técnicas Implementadas**

- **Estrutura do Expo Router**: Migração completa para usar o Expo Router ao invés do React Navigation
- **Correção de Importações**: Todos os problemas de módulos não encontrados foram resolvidos
- **Estilos Otimizados**: Substituição de propriedades de sombra depreciadas por versões compatíveis
- **Navegação Simplificada**: Uso de rotas baseadas em arquivos (\`./settings\`) ao invés de rotas absolutas
- **Remoção de Arquivos Desnecessários**: Eliminação de arquivos de navegação e telas duplicados

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.
