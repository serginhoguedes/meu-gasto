import React, { useState } from 'react';
import { CalculationResult } from '../types';
import {
  formatCurrency,
  getFrequencyLabel,
  getTangibleComparisons,
  getLongTermComparisons,
} from '../utils/formatters';
import {
  Calendar,
  CalendarDays,
  CalendarRange,
  Clock,
  Share2,
  AlertTriangle,
  ShoppingBag,
  Fuel,
  Plane,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { haptics } from '../utils/haptics';

interface ResultCardsProps {
  result: CalculationResult;
  onOpenShare: () => void;
}

export const ResultCards: React.FC<ResultCardsProps> = ({ result, onOpenShare }) => {
  const [horizon, setHorizon] = useState<1 | 5 | 10>(1);
  const comparisons = getTangibleComparisons(result.annualValue);

  const horizonValue = result.annualValue * horizon;

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShoppingBag':
        return <ShoppingBag className="h-5 w-5 text-emerald-400" />;
      case 'Fuel':
        return <Fuel className="h-5 w-5 text-amber-400" />;
      case 'Plane':
        return <Plane className="h-5 w-5 text-sky-400" />;
      case 'TrendingUp':
        return <TrendingUp className="h-5 w-5 text-teal-400" />;
      default:
        return <Sparkles className="h-5 w-5 text-emerald-400" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Hero Card: Destaque com Seletor de Horizonte de Tempo */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/40 bg-gradient-to-b from-[#151c23] via-[#12161d] to-[#0e1116] p-6 shadow-2xl sm:p-7">
        {/* Glow de fundo */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Seletor de Horizonte de Tempo: 1 Ano / 5 Anos / 10 Anos */}
          <div className="mb-4 flex items-center gap-1 rounded-xl bg-[#161a24] p-1 border border-[#262c3b]">
            {([1, 5, 10] as const).map((years) => (
              <button
                key={years}
                type="button"
                onClick={() => {
                  haptics.tap();
                  setHorizon(years);
                }}
                className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                  horizon === years
                    ? 'bg-emerald-500 text-[#0c0e12] shadow-sm shadow-emerald-500/20'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {years === 1 ? '1 Ano' : `${years} Anos`}
              </button>
            ))}
          </div>

          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-400">
            <span>Impacto do Hábito: {result.name}</span>
          </div>

          <p className="text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-1">
            {horizon === 1 ? 'Esse hábito pode representar' : `Acúmulo total em ${horizon} anos`}
          </p>

          {/* Tipografia Gigante */}
          <div className="my-2 flex items-baseline justify-center gap-1">
            <span className="font-mono-numbers text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-emerald-400 drop-shadow-[0_4px_16px_rgba(16,185,129,0.35)]">
              {formatCurrency(horizonValue)}
            </span>
            <span className="text-sm sm:text-lg font-bold text-neutral-400">
              {horizon === 1 ? '/ ano' : `em ${horizon}a`}
            </span>
          </div>

          <p className="max-w-md text-xs sm:text-sm text-neutral-300">
            {getLongTermComparisons(result.annualValue, horizon)}
          </p>

          {/* Quick share button at hero */}
          <div className="mt-5 flex items-center gap-2">
            <button
              onClick={() => {
                haptics.tap();
                onOpenShare();
              }}
              className="flex items-center gap-2 rounded-xl bg-[#1d2430] border border-emerald-500/30 px-4 py-2.5 text-xs font-bold text-emerald-300 transition-all hover:bg-emerald-500 hover:text-[#0c0e12] hover:border-emerald-500"
            >
              <Share2 className="h-4 w-4" />
              <span>Compartilhar Resultado (Texto ou Imagem)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid de Estimativas: Semanal, Mensal, Anual & Diário */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Diário equivalente */}
        <div className="rounded-xl border border-[#222734] bg-[#14171f] p-4 text-center transition-all hover:border-[#2f3747]">
          <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
            <Clock className="h-4 w-4" />
          </div>
          <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-wide">
            Por Dia (equiv.)
          </p>
          <p className="font-mono-numbers text-base sm:text-lg font-bold text-white mt-0.5">
            {formatCurrency(result.dailyValue)}
          </p>
          <span className="text-[10px] text-neutral-500">365 dias/ano</span>
        </div>

        {/* Semanal */}
        <div className="rounded-xl border border-[#222734] bg-[#14171f] p-4 text-center transition-all hover:border-[#2f3747]">
          <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
            <Calendar className="h-4 w-4" />
          </div>
          <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-wide">
            Por Semana
          </p>
          <p className="font-mono-numbers text-base sm:text-lg font-bold text-white mt-0.5">
            {formatCurrency(result.weeklyValue)}
          </p>
          <span className="text-[10px] text-neutral-500">52 semanas/ano</span>
        </div>

        {/* Mensal */}
        <div className="rounded-xl border border-[#222734] bg-[#14171f] p-4 text-center transition-all hover:border-[#2f3747]">
          <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
            <CalendarDays className="h-4 w-4" />
          </div>
          <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-wide">
            Por Mês
          </p>
          <p className="font-mono-numbers text-base sm:text-lg font-bold text-white mt-0.5">
            {formatCurrency(result.monthlyValue)}
          </p>
          <span className="text-[10px] text-neutral-500">12 meses/ano</span>
        </div>

        {/* Anual Total */}
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-center transition-all hover:border-emerald-500/50">
          <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
            <CalendarRange className="h-4 w-4" />
          </div>
          <p className="text-[11px] font-medium text-emerald-400 uppercase tracking-wide">
            Por Ano
          </p>
          <p className="font-mono-numbers text-base sm:text-lg font-bold text-emerald-300 mt-0.5">
            {formatCurrency(result.annualValue)}
          </p>
          <span className="text-[10px] text-emerald-400/70">Total acumulado</span>
        </div>
      </div>

      {/* Comparações Tangíveis do Mundo Real */}
      {comparisons.length > 0 && (
        <div className="rounded-2xl border border-[#222734] bg-[#14171f] p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              <span>O que esse valor representa na vida real:</span>
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {comparisons.map((c, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 rounded-xl border border-[#262c3b] bg-[#191d27] p-3 transition-colors hover:border-[#384154]"
              >
                <div className="mt-0.5 rounded-lg bg-[#222837] p-2 shrink-0">
                  {getIcon(c.icon)}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{c.title}</h4>
                  <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">
                    {c.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Nota legal / Transparência de estimativa */}
      <div className="flex items-start gap-2 rounded-xl border border-[#232835] bg-[#12141a] p-3 text-[11px] text-neutral-400">
        <AlertTriangle className="h-4 w-4 shrink-0 text-neutral-500 mt-0.5" />
        <p>
          Os valores apresentados são <strong className="text-neutral-300">estimativas matemáticas</strong> baseadas no calendário convencional (365 dias/ano, 52 semanas/ano e 12 meses/ano). Não incluem variações de inflação, correção monetária, juros compostos ou rendimentos de investimentos.
        </p>
      </div>
    </div>
  );
};
