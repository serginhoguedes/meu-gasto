import { CalculationResult, Frequency, TangibleComparison } from '../types';

export const formatCurrency = (val: number): string => {
  if (isNaN(val)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
};

export const formatCompactCurrency = (val: number): string => {
  if (isNaN(val)) return 'R$ 0';
  if (val >= 1000000) {
    return `R$ ${(val / 1000000).toFixed(1).replace('.', ',')} mi`;
  }
  if (val >= 10000) {
    return `R$ ${(val / 1000).toFixed(1).replace('.', ',')} mil`;
  }
  return formatCurrency(val);
};

export const parseCurrencyInput = (raw: string): number => {
  if (!raw) return 0;
  // Remove non-numeric characters except comma and dot
  const clean = raw.trim().replace(/[^\d.,]/g, '');
  if (!clean) return 0;

  // If contains both dots and commas (e.g. 1.250,50)
  if (clean.includes('.') && clean.includes(',')) {
    const normalized = clean.replace(/\./g, '').replace(',', '.');
    return parseFloat(normalized) || 0;
  }

  // If contains comma (e.g. 12,50)
  if (clean.includes(',')) {
    const normalized = clean.replace(',', '.');
    return parseFloat(normalized) || 0;
  }

  return parseFloat(clean) || 0;
};

export const calculateImpact = (
  name: string,
  value: number,
  frequency: Frequency,
  reductionPercentage: number = 50
): CalculationResult => {
  let annualValue = 0;

  switch (frequency) {
    case 'diario':
      annualValue = value * 365;
      break;
    case 'semanal':
      annualValue = value * 52;
      break;
    case 'mensal':
      annualValue = value * 12;
      break;
  }

  const monthlyValue = annualValue / 12;
  const weeklyValue = annualValue / 52;
  const dailyValue = annualValue / 365;

  const annualSavings = annualValue * (reductionPercentage / 100);
  const reducedAnnualValue = annualValue - annualSavings;

  return {
    id: `calc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: name.trim(),
    value,
    frequency,
    annualValue,
    monthlyValue,
    weeklyValue,
    dailyValue,
    reductionPercentage,
    annualSavings,
    reducedAnnualValue,
    timestamp: Date.now(),
  };
};

export const getFrequencyLabel = (freq: Frequency): string => {
  switch (freq) {
    case 'diario':
      return 'Diário';
    case 'semanal':
      return 'Semanal';
    case 'mensal':
      return 'Mensal';
  }
};

export const getTangibleComparisons = (annualValue: number): TangibleComparison[] => {
  const comparisons: TangibleComparison[] = [];

  // Cestas básicas (~R$ 780,00)
  const cestas = Math.floor(annualValue / 780);
  if (cestas >= 1) {
    comparisons.push({
      title: 'Cestas Básicas',
      count: cestas,
      unit: cestas === 1 ? 'cesta' : 'cestas',
      description: `Equivale a ${cestas} ${cestas === 1 ? 'cesta básica completa' : 'cestas básicas completas'} de alimentação.`,
      icon: 'ShoppingBag',
    });
  }

  // Tanques de combustível 50L (~R$ 290,00)
  const tanques = Math.floor(annualValue / 290);
  if (tanques >= 1) {
    comparisons.push({
      title: 'Tanques de Combustível',
      count: tanques,
      unit: tanques === 1 ? 'tanque' : 'tanques',
      description: `Daria para encher o tanque do carro ${tanques} ${tanques === 1 ? 'vez' : 'vezes'}.`,
      icon: 'Fuel',
    });
  }

  // Viagens de férias / fins de semana (~R$ 1.800)
  const viagens = Math.floor(annualValue / 1800);
  if (viagens >= 1) {
    comparisons.push({
      title: 'Férias & Viagens',
      count: viagens,
      unit: viagens === 1 ? 'viagem' : 'viagens',
      description: `Equivale a ${viagens} ${viagens === 1 ? 'viagem de descanso' : 'viagens ou passeios completos'}.`,
      icon: 'Plane',
    });
  } else if (annualValue >= 400) {
    comparisons.push({
      title: 'Fim de Semana Especial',
      count: 1,
      unit: 'passeio',
      description: 'Poderia bancar uma escapada de fim de semana ou jantar especial.',
      icon: 'Plane',
    });
  }

  // Reserva de Emergência / Rendimento a 10% a.a.
  const rendimentoAno = annualValue * 0.105;
  if (rendimentoAno >= 50) {
    comparisons.push({
      title: 'Rendimento no CDI',
      count: Math.round(rendimentoAno),
      unit: 'R$',
      description: `Investido a ~10% a.a., geraria ${formatCurrency(rendimentoAno)} de rendimento passivo por ano.`,
      icon: 'TrendingUp',
    });
  }

  return comparisons;
};

export const formatDate = (timestamp: number): string => {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp));
};

export const formatCentsToRawInput = (cents: number): string => {
  if (cents <= 0) return '0,00';
  const val = cents / 100;
  return val.toFixed(2).replace('.', ',');
};

export const getLongTermComparisons = (annualValue: number, years: 1 | 5 | 10) => {
  const total = annualValue * years;
  if (years === 5) {
    if (total >= 15000) {
      return `Em 5 anos, esse hábito consome ${formatCurrency(total)}, o equivalente a uma moto 0km ou intercâmbio/viagem internacional.`;
    }
    return `Em 5 anos, esse gasto acumula ${formatCurrency(total)} que poderiam ser sua reserva de emergência completa.`;
  }
  if (years === 10) {
    if (total >= 40000) {
      return `Em 10 anos, esse hábito consome impressionantes ${formatCurrency(total)}, o valor de entrada de um imóvel próprio ou carro novo.`;
    }
    return `Em 10 anos acumulados, são ${formatCurrency(total)} saindo do seu patrimônio.`;
  }
  return `Esse hábito representa ${formatCurrency(total)} por ano.`;
};
