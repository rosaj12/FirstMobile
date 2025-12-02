# 📒 Bloco de Notas Inteligente

Um aplicativo mobile completo e moderno para gerenciamento de notas, desenvolvido com React Native e Expo.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React Native](https://img.shields.io/badge/React%20Native-0.76.5-blue.svg)
![Expo](https://img.shields.io/badge/Expo-SDK%2054-purple.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue.svg)

## 📱 Sobre o Projeto

O **Bloco de Notas Inteligente** é uma aplicação mobile multiplataforma que permite aos usuários criar, organizar, buscar e gerenciar suas notas de forma intuitiva e eficiente. Com suporte a temas escuro/claro, categorização, busca avançada e armazenamento persistente, o app oferece uma experiência completa para organização de ideias e tarefas.

## ✨ Funcionalidades

### 🏠 Página Home
- Interface de boas-vindas elegante com animações suaves
- Apresentação das principais funcionalidades
- Toggle rápido de tema claro/escuro
- Transições animadas entre telas

### 📝 Sistema CRUD Completo
- **Create**: Criar novas notas com título e conteúdo
- **Read**: Visualizar todas as notas em cards organizados
- **Update**: Editar notas existentes
- **Delete**: Remover notas com confirmação

### 🎨 Interface e Experiência
- Design moderno e responsivo
- **Modo Escuro/Claro**: Alternância completa de temas
- Animações suaves e transições fluidas
- Feedback visual em todas as interações
- Layout adaptativo para diferentes tamanhos de tela

### 🏷️ Categorização
5 categorias predefinidas para organizar suas notas:
- 📝 Pessoal
- 💼 Trabalho
- 🎓 Estudos
- 💡 Ideias
- 📌 Outros

### 🔍 Busca e Filtros
- **Busca em tempo real**: Pesquise por título ou conteúdo
- **Filtros por categoria**: Visualize apenas notas de uma categoria específica
- **Múltiplas opções de ordenação**:
  - ⏰ Mais Recentes
  - 🕐 Mais Antigas
  - 🔤 Alfabética
  - 🏷️ Por Categoria

### ⚙️ Painel de Controle Lateral
Menu deslizante com funcionalidades avançadas:

#### 📊 Estatísticas
- Total de notas criadas
- Total de caracteres escritos
- Distribuição por categoria

#### 🔄 Ordenação
- 4 modos de ordenação diferentes
- Marcação visual da opção ativa

#### ⚙️ Configurações
- Toggle de modo escuro/claro com switch animado
- Preferências salvas automaticamente

#### 🎯 Ações Rápidas
- Limpar todas as notas (com confirmação)
- Exportar notas (em desenvolvimento)

### 👆 Gestos Interativos
- **Swipe da borda esquerda**: Abre o painel lateral
- **Swipe para esquerda**: Fecha o painel
- **Toque fora do painel**: Fecha automaticamente
- Detecção de velocidade para resposta rápida

### 💾 Armazenamento Persistente
- **AsyncStorage**: Todas as notas são salvas localmente
- **Auto-save**: Salvamento automático a cada mudança
- **Carregamento automático**: Notas restauradas ao abrir o app
- **Preferências salvas**: Tema escuro/claro persistente

### 📏 Limitações Inteligentes
- Título: máximo 50 caracteres
- Conteúdo: máximo 500 caracteres
- Contador de caracteres em tempo real

## 🚀 Tecnologias Utilizadas

### Core
- **React Native**: Framework para desenvolvimento mobile
- **Expo**: Plataforma para desenvolvimento e deploy
- **TypeScript**: Tipagem estática para maior segurança

### Bibliotecas e APIs
- **@react-native-async-storage/async-storage**: Armazenamento local
- **React Hooks**: useState, useEffect, useCallback, useMemo, useRef
- **Animated API**: Animações nativas de alta performance
- **PanResponder**: Gestos tácteis avançados
- **Dimensions API**: Responsividade

### Funcionalidades Implementadas
- Modal para criação/edição de notas
- StatusBar adaptativa ao tema
- ScrollView com bounce effect
- TouchableOpacity com feedback visual
- TextInput com placeholders dinâmicos

## 📦 Instalação

### Pré-requisitos
- Node.js (versão 14 ou superior)
- npm ou yarn
- Expo CLI (instalado globalmente ou via npx)

### Passo a Passo

1. **Clone o repositório**
```bash
git clone [url-do-repositorio]
cd my-app
```

2. **Instale as dependências**
```bash
npm install
```

3. **Inicie o projeto**
```bash
npx expo start
```

## 🖥️ Como Usar

### Mobile (Android/iOS)

1. Instale o aplicativo **Expo Go** no seu dispositivo:
   - [Android - Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - [iOS - App Store](https://apps.apple.com/app/expo-go/id982107779)

2. Execute `npx expo start`

3. Escaneie o QR code com:
   - **Android**: App Expo Go
   - **iOS**: Câmera nativa

### Web Browser

1. Execute `npx expo start`

2. Pressione `w` no terminal OU acesse `http://localhost:8081`

### Emulador Android

1. Configure o Android Studio e um emulador

2. Execute `npx expo start`

3. Pressione `a` no terminal

## 📖 Guia de Uso

### Criando uma Nota
1. Na tela principal, toque no botão flutuante **+** (canto inferior direito)
2. Digite o título da nota (máx. 50 caracteres)
3. Digite o conteúdo (máx. 500 caracteres)
4. Selecione uma categoria
5. Toque em "➕ Criar Nota"

### Editando uma Nota
1. Toque em qualquer card de nota
2. Modifique o título, conteúdo ou categoria
3. Toque em "💾 Salvar Alterações"

### Deletando uma Nota
1. Toque no ícone 🗑️ no card da nota
2. Confirme a exclusão

### Buscando Notas
1. Use a barra de busca no topo (🔍)
2. Digite palavras do título ou conteúdo
3. Os resultados aparecem em tempo real

### Filtrando por Categoria
1. Toque em um dos chips de categoria abaixo da busca
2. Apenas notas da categoria selecionada serão exibidas
3. Toque em "Todas" para ver todas as notas

### Acessando o Painel Lateral
- **Opção 1**: Toque no ícone ☰ (canto superior esquerdo)
- **Opção 2**: Deslize da borda esquerda para a direita

### Ordenando Notas
1. Abra o painel lateral
2. Em "🔄 Ordenar Por", escolha uma opção
3. O painel fecha automaticamente e as notas são reordenadas

### Alternando Tema
- **Da Home**: Toque em "🌙/☀️ Alternar Tema"
- **Do Painel**: Abra o painel → Configurações → Toggle do tema

## 🎨 Estrutura de Temas

### Tema Claro (Padrão)
- Fundo: #f8f9fa
- Cards: #fff
- Header: #6366f1
- Texto: #111827

### Tema Escuro
- Fundo: #1a1a1a
- Cards: #2d2d2d
- Header: #4338ca
- Texto: #f3f4f6

## 🗂️ Estrutura do Projeto

```
my-app/
├── App.tsx                 # Componente principal
├── app.json               # Configuração do Expo
├── package.json           # Dependências
├── tsconfig.json          # Configuração TypeScript
├── README.md              # Este arquivo
└── assets/                # Ícones e imagens
```

## 🔧 Arquitetura

### Estado Global
O app utiliza React Hooks para gerenciamento de estado:

```typescript
interface Note {
  id: number;
  title: string;
  content: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Estados Principais
- `notes`: Array de notas
- `isDarkMode`: Modo escuro ativado/desativado
- `modalVisible`: Controle do modal de criação/edição
- `drawerVisible`: Controle do painel lateral
- `searchQuery`: Texto da busca
- `filterCategory`: Categoria selecionada
- `sortBy`: Modo de ordenação

### Animações
- `drawerAnimation`: Posição do painel lateral
- `overlayAnimation`: Opacidade do overlay
- `fadeAnim`: Fade in/out da home
- `slideAnim`: Slide up da home

## 🎯 Funcionalidades Futuras

- [ ] Exportar notas para PDF/TXT
- [ ] Importar notas
- [ ] Notas com imagens
- [ ] Tags personalizadas
- [ ] Notas fixadas (pin)
- [ ] Compartilhamento de notas
- [ ] Backup na nuvem
- [ ] Autenticação de usuário
- [ ] Sincronização multi-dispositivo
- [ ] Widget para tela inicial
- [ ] Modo de visualização lista/grid
- [ ] Atalhos de teclado (web)

## 🐛 Problemas Conhecidos

Nenhum problema conhecido no momento. Reporte bugs através das Issues do GitHub.

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Faça um Fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Autor

Desenvolvido por Johannes Rosa usando React Native e Expo

## 🙏 Agradecimentos

- React Native Community
- Expo Team
- Todos os contribuidores de bibliotecas open source utilizadas

---

**Versão**: 1.0.0  
**Última atualização**: Dezembro 2025  
**Status**: ✅ Estável e em produção
