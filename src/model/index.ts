export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GeminiRequestBody {
  model: string;
  messages: Message[];
  temperature: number;
  max_tokens: number;
}

export interface GeminiResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Choice[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface Choice {
  message: Message;
  finish_reason: string;
  index: number;
}

export interface EvaluationItem {
  number: string;
  characteristics: string;
  activity?: string;
  result: string;
}

export interface ExcelData {
  evaluations: EvaluationItem[];
}

export type SchoolCategory = 'ele' | 'kinder' | 'mid';
