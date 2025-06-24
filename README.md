# AI Chrome Side Panel Extension

Uma extensão para o Chrome que adiciona um painel lateral (side panel) com recursos de IA para interagir com o conteúdo da página atual.

## Funcionalidades

- Extração inteligente do conteúdo principal da página
- Painel lateral React com interface amigável
- Ações rápidas: resumir, simplificar, extrair dados, reescrever
- Suporte a múltiplos idiomas (pt-BR, pt-PT, en, es)
- Campo para perguntas livres sobre o conteúdo
- Detecção de mudança de URL em aplicações SPA (Single Page Applications)

## Estrutura do Projeto

```
src/
├── background/     # Service worker para gerenciar a extensão
├── content/        # Scripts que rodam na página para extrair conteúdo
├── panel/          # Interface React do painel lateral
│   ├── components/ # Componentes React
├── shared/         # Tipos e constantes compartilhadas
└── utils/          # Funções utilitárias
```

## Tecnologias Utilizadas

- React
- TypeScript
- Vite
- Chrome Extension API (Manifest V3)

## Desenvolvimento

### Pré-requisitos

- Node.js (v14+)
- npm ou yarn

### Instalação

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Construir para produção
npm run build
```

### Carregando a extensão no Chrome

1. Abra o Chrome e navegue para `chrome://extensions/`
2. Ative o "Modo do desenvolvedor"
3. Clique em "Carregar sem compactação"
4. Selecione a pasta `dist` gerada após o build

## Configuração do Backend

A extensão se comunica com um backend via API REST. Configure a URL do backend no arquivo `src/utils/api.ts`.

O backend deve ser publicado numa conta AWS ou então rodar local. Você pode obter o projeto aqui: https://github.com/epiresdasilva/ai-chrome-sidepanel-backend