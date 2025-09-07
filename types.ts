export enum InputMode {
  BARCODE = 'barcode',
  TEXT = 'text',
  IMAGE = 'image',
}

export interface Nutrient {
  name: string;
  amount: string;
  dailyValue?: string;
}

export interface HealthScoreDriver {
  type: 'positive' | 'negative';
  explanation: string;
}

export interface EvidenceRule {
  rule: string;
  status: 'fired' | 'not_fired' | 'not_applicable';
  value: string;
}

export interface EvidenceSource {
  name: string;
  url?: string;
}

export interface HealthSuggestion {
  title: string;
  description: string;
}

export interface AnalysisResult {
  productName: string;
  normalizedData: {
    servingSize: string;
    calories: number;
    ingredients: string[];
    nutrients: Nutrient[];
  };
  missingInfo: string[];
  healthScore: {
    score: number;
    band: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Very Poor';
    drivers: HealthScoreDriver[];
  };
  evidencePanel: {
    rules: EvidenceRule[];
    sources: EvidenceSource[];
  };
  healthSuggestions: HealthSuggestion[];
}

export interface HistoryItem {
  id: string;
  productName: string;
  score: number;
  band: string;
  data: AnalysisResult;
}