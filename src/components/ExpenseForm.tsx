import React, { useState } from 'react';
import { Frequency, SuggestionCategory } from '../types';
import { parseCurrencyInput } from '../utils/formatters';
import { haptics } from '../utils/haptics';
import { Calculator, RotateCcw, AlertCircle, ArrowRight, Settings2 } from 'lucide-react';

interface ExpenseFormProps {
  categories: SuggestionCategory[];
  onOpenManageCategories: () => void;
  onCalculate: (name: string, value: number, frequency: Frequency) => void;
  onClear: () => void;
  initialName?: string;
  initialValue?: number;
  initialFrequency?: Frequency;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({
  categories,
  onOpenManageCategories,
  onCalculate,
  onClear,
  initialName = '',
  initialValue,
  initialFrequency = 'diario',
}) => {
  const [name, setName] = useState<string>(initialName);
  const [rawValue, setRawValue] = useState<string>(
    initialValue && initialValue > 0 ? initialValue.toFixed(2).replace('.', ',') : ''
  );
  const [frequency, setFrequency] = useState<Frequency>(initialFrequency);
  const [error, setError] = useState<string | null>(null);

  const handleSelectSuggestion = (sug: SuggestionCategory) => {
    haptics.tap();
    setName(sug.label);
    setRawValue(sug.defaultVal);
    setFrequency(sug.freq);
    setError(null);
  };

  // Nubank / Caixa Eletrônico auto-cents input:
  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawDigits = e.target.value.replace(/\D/g, '');
    if (!rawDigits) {
      setRawValue('');
      if (error) setError(null);
      return;
    }

    const centsNumber = parseInt(rawDigits.slice(0, 10), 10); // cap max length
    const formatted = (centsNumber / 100).toFixed(2).replace('.', ',');
    setRawValue(formatted);
    if (error) setError(null);
  };

  // Quick increment buttons (+R$ 1, +R$ 5, +R$ 10, +R$ 20)
  const handleAddIncrement = (amount: number) => {
    haptics.tap();
    const currentVal = parseCurrencyInput(rawValue);
    const newVal = currentVal + amount;
    setRawValue(newVal.toFixed(2).replace('.', ','));
    if (error) setError(null);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Por favor, informe o nome do hábito ou gasto (ex: Café, Lanche, Delivery).');
      haptics.tap();
      return;
    }

    const parsedVal = parseCurrencyInput(rawValue);
    if (parsedVal <= 0) {
      setError('Informe um valor em reais maior do que zero (ex: 5,50).');
      haptics.tap();
      return;
    }

    if (parsedVal > 1000000) {
      setError('O valor inserido é muito alto para um pequeno gasto recorrente.');
      haptics.tap();
      return;
    }

    setError(null);
    haptics.success();
    onCalculate(trimmedName, parsedVal, frequency);
  };

  const handleReset = () => {
    haptics.tap();
    setName('');
    setRawValue('');
    setFrequency('diario');
    setError(null);
    onClear();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative rounded-2xl border border-[#232936] bg-[#14171f] p-5 shadow-xl sm:p-6 transition-all"
    >
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-base font-semibold text-white flex items-center gap-2">
          <span>Identifique o pequeno gasto</span>
        </h2>
        {(name || rawValue) && (
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1 text-xs text-neutral-400 hover:text-emerald-400 transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Limpar campos</span>
          </button>
        )}
      </div>

      {/* Sugestões rápidas de hábitos frequentes */}
      <div className="mb-5">
        <div className="mb-2 flex items-center justify-between">
          <label className="text-xs font-medium text-neutral-400">
            Sugestões frequentes com custo pré-cadastrado:
          </label>
          <button
            type="button"
            onClick={() => {
              haptics.tap();
              onOpenManageCategories();
            }}
            className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <Settings2 className="h-3 w-3" />
            <span>Gerenciar</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {categories.map((sug) => {
            const isSelected = name === sug.label;
            return (
              <button
                key={sug.id}
                type="button"
                onClick={() => handleSelectSuggestion(sug)}
                className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs transition-all ${
                  isSelected
                    ? 'border-emerald-500/60 bg-emerald-500/20 text-emerald-300 font-semibold shadow-sm shadow-emerald-500/15'
                    : 'border-[#262c39] bg-[#1a1e28] text-neutral-300 hover:border-[#384152] hover:bg-[#202532]'
                }`}
              >
                <span>{sug.icon}</span>
                <span>{sug.label}</span>
                <span
                  className={`text-[10px] font-mono-numbers px-1 rounded ${
                    isSelected
                      ? 'bg-emerald-500/30 text-emerald-200'
                      : 'bg-[#222836] text-neutral-400'
                  }`}
                >
                  R$ {sug.defaultVal}
                </span>
                {sug.isCustom && (
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" title="Criado por você" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Campo 1: Nome do Gasto */}
      <div className="mb-4">
        <label htmlFor="expense-name" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-neutral-300">
          1. Nome do gasto
        </label>
        <div className="relative">
          <input
            id="expense-name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Ex: Café na padaria, Cigarro, Marmita, Streaming..."
            maxLength={60}
            className="w-full rounded-xl border border-[#2b3342] bg-[#1a1e29] px-4 py-3 text-sm text-white placeholder-neutral-500 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Grid com Campo 2 (Valor) e Campo 3 (Frequência) */}
      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-12">
        {/* Campo 2: Valor gasto */}
        <div className="sm:col-span-5">
          <label htmlFor="expense-value" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-neutral-300">
            2. Valor gasto a cada vez
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-emerald-400">
              R$
            </span>
            <input
              id="expense-value"
              type="text"
              inputMode="numeric"
              value={rawValue}
              onChange={handleValueChange}
              placeholder="0,00"
              className="w-full rounded-xl border border-[#2b3342] bg-[#1a1e29] py-3 pl-10 pr-3 font-mono-numbers text-base font-bold text-white placeholder-neutral-500 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          {/* Botões de acréscimo rápido */}
          <div className="mt-2 flex items-center gap-1.5">
            {[1, 5, 10, 20].map((inc) => (
              <button
                key={inc}
                type="button"
                onClick={() => handleAddIncrement(inc)}
                className="flex-1 rounded-lg border border-[#262c3b] bg-[#171b24] py-1 text-[11px] font-mono-numbers font-semibold text-neutral-300 hover:border-emerald-500/40 hover:bg-[#1f2533] hover:text-emerald-300 transition-colors"
                title={`Adicionar R$ ${inc},00 ao valor`}
              >
                +{inc}
              </button>
            ))}
          </div>
        </div>

        {/* Campo 3: Seletor de Frequência */}
        <div className="sm:col-span-7">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-neutral-300">
            3. Frequência com que acontece
          </label>
          <div className="grid grid-cols-3 gap-1.5 rounded-xl border border-[#2b3342] bg-[#1a1e29] p-1">
            {(
              [
                { id: 'diario', label: 'Diário', note: '365x / ano' },
                { id: 'semanal', label: 'Semanal', note: '52x / ano' },
                { id: 'mensal', label: 'Mensal', note: '12x / ano' },
              ] as const
            ).map((item) => {
              const isSelected = frequency === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    haptics.tap();
                    setFrequency(item.id);
                  }}
                  className={`flex flex-col items-center justify-center rounded-lg py-2 transition-all ${
                    isSelected
                      ? 'bg-emerald-500 text-[#0c0e12] font-bold shadow-md shadow-emerald-500/20'
                      : 'text-neutral-400 hover:text-white hover:bg-[#232938]'
                  }`}
                >
                  <span className="text-xs">{item.label}</span>
                  <span
                    className={`text-[10px] ${
                      isSelected ? 'text-[#0c0e12]/80 font-semibold' : 'text-neutral-500'
                    }`}
                  >
                    {item.note}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Erro de validação */}
      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Botões de Ação */}
      <div className="flex flex-col gap-2.5 sm:flex-row">
        <button
          type="submit"
          className="group relative flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3.5 px-6 font-bold text-[#0c0e12] shadow-lg shadow-emerald-500/25 transition-all hover:bg-emerald-400 hover:shadow-emerald-500/40 active:scale-[0.98]"
        >
          <Calculator className="h-5 w-5" />
          <span className="text-sm tracking-wide">CALCULAR IMPACTO</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>

        <button
          type="button"
          onClick={handleReset}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-[#2b3342] bg-[#1a1e28] py-3 px-4 text-xs font-semibold text-neutral-300 hover:border-[#3d475c] hover:bg-[#202532] hover:text-white transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Limpar</span>
        </button>
      </div>
    </form>
  );
};
