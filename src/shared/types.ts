export type Language = 'pt-BR' | 'pt-PT' | 'en' | 'es';

export type Action = 'resumir' | 'simplificar' | 'extrair_dados' | 'reescrever' | 'pergunta';

export interface Message {
  action: Action;
  content?: string;
  userInput?: string;
  language?: Language;
}

export interface ResponseData {
  response: string;
  error?: string;
}
