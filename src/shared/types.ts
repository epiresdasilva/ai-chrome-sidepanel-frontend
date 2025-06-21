export type Language = 'pt-BR' | 'pt-PT' | 'en' | 'es';

export interface Message {
  action: string;
  content?: string;
  question?: string;
  language?: Language;
}

export interface ResponseData {
  response: string;
  error?: string;
}
