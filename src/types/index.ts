export type Frequency = 'diario' | 'semanal' | 'mensal';

export interface CalculationResult {
  id: string;
  name: string;
  value: number; // Valor informado
  frequency: Frequency;
  annualValue: number;
  monthlyValue: number;
  weeklyValue: number;
  dailyValue: number;
  reductionPercentage: number;
  annualSavings: number;
  reducedAnnualValue: number;
  timestamp: number;
}

export interface TangibleComparison {
  title: string;
  count: number;
  unit: string;
  description: string;
  icon: string;
}

export interface SuggestionCategory {
  id: string;
  label: string;
  icon: string;
  defaultVal: string; // Ex: "15,00"
  freq: Frequency;
  isCustom?: boolean;
}
