# Aplicativo de Impressão de Etiquetas

Este é um aplicativo React Native desenvolvido com Expo Go para impressão de etiquetas em impressoras de rede ESC/POS.

## 🚀 Funcionalidades

- **Tela Principal**: Interface para inserir nome e código e imprimir etiquetas
- **Configurações da Impressora**: Tela para configurar IP, porta e padrão de impressão
- **Teste de Impressão**: Funcionalidade para testar a conectividade com a impressora
- **Armazenamento Local**: As configurações da impressora são salvas localmente

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

### Imprimindo Etiquetas

1. Na tela principal, digite:
   - **Nome**: Nome que será impresso na etiqueta
   - **Código**: Código que será impresso na etiqueta
2. Toque em "Confirmar e Imprimir"
3. A etiqueta será enviada para a impressora configurada

## 🛠️ Instalação e Desenvolvimento

### Pré-requisitos

- Node.js (versão 16 ou superior)
- npm ou yarn
- Expo CLI instalado globalmente
- Aplicativo Expo Go no celular (Android/iOS)

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

3. Inicie o servidor de desenvolvimento:
\`\`\`bash
npm start
\`\`\`

4. Abra o aplicativo Expo Go no celular e escaneie o QR code

## 🔧 Dependências Principais

- **expo-router**: Sistema de navegação baseado em arquivos do Expo
- **@react-native-async-storage/async-storage**: Armazenamento local das configurações
- **react-native-esc-pos-printer**: Impressão ESC/POS (simulada no desenvolvimento)
- **@react-native-picker/picker**: Seletor de padrões de impressão

## 📋 Estrutura do Projeto

\`\`\`
src/
├── app/
│   ├── _layout.tsx        # Layout raiz com Stack Navigator
│   ├── index.tsx          # Tela principal
│   └── settings.tsx       # Tela de configurações
└── utils/
    ├── storage.ts         # Funções de armazenamento
    └── printer.ts         # Funções de impressão
\`\`\`

## ⚠️ Notas Importantes

### Sobre a Impressão

Atualmente, a funcionalidade de impressão está **simulada** para funcionar no ambiente de desenvolvimento do Expo Go. Para implementar a impressão real em produção, você precisará:

1. **Ejetar o Expo** para ter acesso total ao código nativo
2. **Usar bibliotecas específicas** como:
   - \`react-native-esc-pos-printer\` para impressoras EPSON
   - \`react-native-tcp-socket\` para comunicação TCP/IP customizada
   - Ou implementar um servidor intermediário que gerencie a impressão

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

### Aplicativo não Carrega
- Verifique se todas as dependências foram instaladas
- Tente limpar o cache: \`expo start -c\`
- Certifique-se de que o celular está na mesma rede Wi-Fi do computador

### Correções Implementadas

- **Estrutura do Expo Router**: Migração completa para usar o Expo Router ao invés do React Navigation
- **Correção de Importações**: Todos os problemas de módulos não encontrados foram resolvidos
- **Estilos Otimizados**: Substituição de propriedades de sombra depreciadas por versões compatíveis
- **Navegação Simplificada**: Uso de rotas baseadas em arquivos (\`./settings\`) ao invés de rotas absolutas
- **Remoção de Arquivos Desnecessários**: Eliminação de arquivos de navegação e telas duplicados

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.
