import React from 'react';
import { CalculationResult } from '../types';
import { formatCurrency } from '../utils/formatters';
import { Target, TrendingDown, PiggyBank, Sparkles, CheckCircle2 } from 'lucide-react';
import { haptics } from '../utils/haptics';

interface ReductionGoalProps {
  result: CalculationResult;
  onUpdatePercentage: (pct: number) => void;
}

export const ReductionGoal: React.FC<ReductionGoalProps> = ({
  result,
  onUpdatePercentage,
}) => {
  const pct = result.reductionPercentage;
  const annualSavings = result.annualValue * (pct / 100);
  const monthlySavings = annualSavings / 12;
  const remainingAnnual = result.annualValue - annualSavings;

  const presets = [25, 50, 75, 100];

  return (
    <div className="rounded-2xl border border-[#232936] bg-[#14171f] p-5 shadow-xl sm:p-6">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
            <Target className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Meta de Redução de Gastos</h3>
            <p className="text-xs text-neutral-400">
              Veja quanto dinheiro sobra no seu bolso diminuindo a frequência
            </p>
          </div>
        </div>

        {/* Badge do percentual atual */}
        <div className="mt-2 sm:mt-0 flex items-center gap-2">
          <span className="rounded-lg bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 font-mono-numbers text-sm font-bold text-emerald-300">
            {pct}% de redução
          </span>
        </div>
      </div>

      {/* Botões de atalho de meta */}
      <div className="mb-5 grid grid-cols-4 gap-2">
        {presets.map((p) => {
          const isSelected = pct === p;
          return (
            <button
              key={p}
              type="button"
              onClick={() => {
                haptics.tap();
                onUpdatePercentage(p);
              }}
              className={`rounded-xl py-2 px-3 text-center transition-all ${
                isSelected
                  ? 'bg-emerald-500 text-[#0c0e12] font-bold shadow-md shadow-emerald-500/25'
                  : 'bg-[#1a1e28] border border-[#2b3342] text-neutral-300 hover:border-[#3c465a] hover:text-white'
              }`}
            >
              <div className="text-xs sm:text-sm font-bold">{p}%</div>
              <div
                className={`text-[10px] ${
                  isSelected ? 'text-[#0c0e12]/80 font-medium' : 'text-neutral-500'
                }`}
              >
                {p === 100 ? 'Eliminar' : p === 50 ? 'Metade' : `Cortar ${p}%`}
              </div>
            </button>
          );
        })}
      </div>

      {/* Slider interativo */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
          <span>Ajuste fino da redução:</span>
          <span className="font-mono-numbers font-semibold text-emerald-400">{pct}%</span>
        </div>
        <input
          type="range"
          min="5"
          max="100"
          step="5"
          value={pct}
          onChange={(e) => onUpdatePercentage(Number(e.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-[#252b39] accent-emerald-500 focus:outline-none"
        />
        <div className="mt-1 flex justify-between text-[10px] text-neutral-500">
          <span>5% (ajuste suave)</span>
          <span>50% (metade)</span>
          <span>100% (corte total)</span>
        </div>
      </div>

      {/* Barra visual proporcional */}
      <div className="mb-6">
        <div className="mb-1.5 flex justify-between text-xs">
          <span className="text-neutral-400">Distribuição do Gasto Anual:</span>
        </div>
        <div className="flex h-4 w-full overflow-hidden rounded-full bg-[#1e2330] p-0.5 border border-[#283040]">
          <div
            style={{ width: `${pct}%` }}
            className="flex items-center justify-center rounded-full bg-emerald-500 transition-all duration-300"
            title={`Economia: ${pct}%`}
          />
          <div
            style={{ width: `${100 - pct}%` }}
            className="flex items-center justify-center rounded-full bg-[#353d4f] transition-all duration-300"
            title={`Ainda gasto: ${100 - pct}%`}
          />
        </div>
        <div className="mt-1.5 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
            <span>Você economiza: {pct}%</span>
          </div>
          <div className="flex items-center gap-1.5 text-neutral-400">
            <span className="h-2 w-2 rounded-full bg-[#353d4f] inline-block" />
            <span>Gasto mantido: {100 - pct}%</span>
          </div>
        </div>
      </div>

      {/* Cards de resultado da meta */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Economia Anual */}
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold mb-1">
            <PiggyBank className="h-4 w-4" />
            <span>ECONOMIA ANUAL NO BOLSO</span>
          </div>
          <p className="font-mono-numbers text-xl sm:text-2xl font-black text-emerald-300">
            + {formatCurrency(annualSavings)}
          </p>
          <p className="text-[11px] text-emerald-400/80 mt-1">
            Representa cerca de <strong className="text-emerald-200">{formatCurrency(monthlySavings)}</strong> a mais todo mês.
          </p>
        </div>

        {/* Novo Gasto Restante */}
        <div className="rounded-xl border border-[#262c3b] bg-[#1a1e28] p-4">
          <div className="flex items-center gap-2 text-neutral-400 text-xs font-semibold mb-1">
            <TrendingDown className="h-4 w-4" />
            <span>NOVO GASTO ANUAL RESTANTE</span>
          </div>
          <p className="font-mono-numbers text-xl sm:text-2xl font-bold text-white">
            {formatCurrency(remainingAnnual)}
          </p>
          <p className="text-[11px] text-neutral-400 mt-1">
            {pct === 100
              ? 'Hábito 100% zerado!'
              : `Você ainda consome ${(100 - pct)}% do hábito sem culpa.`}
          </p>
        </div>
      </div>

      {/* Dica encorajadora */}
      <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-[#19221d] border border-emerald-500/20 p-3 text-xs text-emerald-200">
        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
        <p>
          {pct === 100
            ? 'Eliminar esse gasto libera R$ ' + annualSavings.toFixed(2).replace('.', ',') + ' todo ano para você investir nos seus sonhos.'
            : `Reduzindo apenas ${pct}%, você ainda aproveita seu hábito moderadamente e poupa ${formatCurrency(annualSavings)} todos os anos!`}
        </p>
      </div>
    </div>
  );
};
