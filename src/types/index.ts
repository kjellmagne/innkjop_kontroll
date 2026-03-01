export interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice?: number;
}

export interface DocumentData {
  supplierName?: string;
  date?: string;
  items: LineItem[];
  totalAmount?: number;
  currency?: string;
}

export interface ComparisonResult {
  description: string;
  agreementPrice: number | null;
  invoicePrice: number | null;
  variance: number | null; 
  isMatch: boolean;
  status: 'MATCH' | 'OVERCHARGED' | 'NOT_IN_AGREEMENT' | 'MISSING_IN_INVOICE' | 'UNDERCHARGED';
}

export type LLMProvider = 'vllm' | 'gemini' | 'openai';

export interface LLMConfig {
  provider: LLMProvider;
  model: string;
  apiKey?: string;
  baseUrl?: string; // e.g. http://localhost:8000/v1 for vLLM
}
