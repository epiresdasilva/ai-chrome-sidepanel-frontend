# AI Chrome Side Panel Extension - Documentação

## Visão Geral

Esta extensão para Chrome implementa um painel lateral (side panel) que permite aos usuários interagir com o conteúdo da página atual através de uma interface de IA. A extensão extrai o conteúdo principal da página, ignorando elementos como cabeçalhos, menus de navegação e rodapés, e permite que o usuário realize ações como resumir, simplificar, extrair dados ou reescrever o conteúdo, além de fazer perguntas livres sobre o material.

## Arquitetura

A extensão segue a arquitetura Manifest V3 do Chrome e é composta por três componentes principais:

1. **Content Script**: Executa no contexto da página web para extrair o conteúdo principal.
2. **Background Script (Service Worker)**: Gerencia o estado da extensão e coordena a comunicação entre o content script e o painel lateral.
3. **Side Panel (React)**: Interface de usuário que permite interagir com o conteúdo extraído.

## Fluxo de Dados

1. O content script extrai o conteúdo principal da página quando ela é carregada.
2. O conteúdo extraído é enviado para o background script.
3. Quando o usuário abre o painel lateral, o background script envia o conteúdo atual para o painel.
4. O usuário interage com o painel (seleciona idioma, clica em ações rápidas ou faz perguntas).
5. O painel envia solicitações para o backend de IA via API REST.
6. As respostas do backend são exibidas no painel.

## Detecção de Navegação em SPAs

Para aplicações de página única (SPAs) como Notion e Medium, a extensão utiliza um MutationObserver para detectar mudanças na URL sem recarregamento completo da página. Quando uma mudança é detectada:

1. O content script aguarda um breve período para que a página seja renderizada.
2. O conteúdo é extraído novamente.
3. O novo conteúdo é enviado para o background script.
4. O background script atualiza o painel lateral, se estiver aberto.

## Personalização

### Configuração do Backend

## Validação de Tokens

A extensão implementa validação de tokens alinhada com o backend para garantir que o conteúdo enviado não exceda os limites:

### Configuração
- **Limite máximo**: 4000 tokens
- **Cálculo**: `Math.ceil(charCount / 4.5)` (idêntico ao backend)
- **Comportamento**: Truncate automático ao invés de bloqueio

### Funcionalidades
- **Truncate inteligente**: Corta o conteúdo no limite de tokens, tentando preservar palavras completas
- **Indicador visual**: Mostra contagem de tokens com barra de progresso e ícones de status
- **Feedback de truncate**: Informa ao usuário quando o conteúdo foi reduzido
- **Preservação de contexto**: Adiciona indicador de truncate no final do conteúdo cortado

### Componentes
- `TokenInfo`: Componente visual que mostra status dos tokens
- `tokenValidation.ts`: Utilitários para estimativa e truncate de tokens
- Integração automática nas funções de API

## Configuração do Backend

A extensão permite configurar a URL do backend de IA diretamente no painel lateral:

### Funcionalidades
- **URL configurável**: Campo para inserir a URL do seu backend
- **Armazenamento local**: Configuração salva no localStorage do Chrome
- **Default inteligente**: Usa `http://localhost:3000` como padrão para desenvolvimento local
- **Validação de URL**: Verifica se a URL inserida é válida
- **Interface amigável**: Modo de edição com botões Salvar/Cancelar

### Como Usar
1. **Primeira configuração**: Ao abrir o painel, configure a URL do seu backend
2. **Editar URL**: Clique em "Editar" para alterar a URL
3. **Salvar**: A configuração é salva automaticamente no navegador
4. **Reutilização**: A URL configurada será lembrada nas próximas sessões

### URLs de Exemplo
- **Desenvolvimento local**: `http://localhost:3000`
- **Servidor remoto**: `https://meu-backend.herokuapp.com`
- **AWS ALB**: `http://ai-backend-alb-123456789.us-east-1.elb.amazonaws.com`

A URL do backend deve expor um endpoint `/ask` que aceita solicitações POST com o seguinte formato:

```json
{
  "action": "resumir|simplificar|extrair_dados|reescrever|pergunta",
  "language": "pt-BR|pt-PT|en|es",
  "content": "Conteúdo extraído da página",
  "userInput": "Pergunta opcional do usuário (apenas para action 'pergunta')"
}
```

### Adição de Novos Idiomas

Para adicionar suporte a novos idiomas:

1. Atualize o tipo `Language` em `src/shared/types.ts`.
2. Adicione a nova opção no componente `LanguageSelector`.

### Adição de Novas Ações Rápidas

Para adicionar novas ações rápidas:

1. Atualize o componente `QuickActions` em `src/panel/components/QuickActions.tsx`.
2. Implemente o suporte correspondente no backend.

## Considerações de Segurança

- A extensão só acessa o conteúdo da página atual quando explicitamente solicitado pelo usuário.
- Nenhum dado é armazenado permanentemente, apenas a preferência de idioma é salva no `chrome.storage.local`.
- Todas as comunicações com o backend devem ser feitas via HTTPS.

## Limitações Conhecidas

- A extração de conteúdo pode não funcionar perfeitamente em todas as páginas, especialmente aquelas com estruturas não convencionais.
- Algumas páginas podem bloquear a execução de content scripts.
- O streaming de respostas pode não funcionar em todos os navegadores.
