import React, { useState } from 'react';
import { Frequency, SuggestionCategory } from '../types';
import { parseCurrencyInput } from '../utils/formatters';
import { haptics } from '../utils/haptics';
import {
  X,
  Plus,
  Trash2,
  Tag,
  Check,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: SuggestionCategory[];
  onAddCategory: (category: Omit<SuggestionCategory, 'id'>) => void;
  onDeleteCategory: (id: string) => void;
  onSelectAndApply: (cat: SuggestionCategory) => void;
}

const PRESET_EMOJIS = [
  '☕', '🍔', '🍕', '🍰', '🍫', '🥤', '🍺', '🍷',
  '🚬', '🚗', '🛵', '🚕', '🎮', '🎟️', '👗', '💇',
  '🏋️', '💊', '⚡', '📦', '🛒', '🐾', '📱', '🎧'
];

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  categories,
  onAddCategory,
  onDeleteCategory,
  onSelectAndApply,
}) => {
  const [name, setName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('☕');
  const [customEmoji, setCustomEmoji] = useState('');
  const [cost, setCost] = useState('');
  const [freq, setFreq] = useState<Frequency>('diario');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Por favor, informe o nome da categoria ou hábito.');
      haptics.tap();
      return;
    }

    const parsedCost = parseCurrencyInput(cost);
    if (parsedCost <= 0) {
      setError('Informe um valor de custo maior que zero (ex: 8,50).');
      haptics.tap();
      return;
    }

    const iconToUse = customEmoji.trim() || selectedEmoji;

    const formattedCost = parsedCost.toFixed(2).replace('.', ',');

    onAddCategory({
      label: trimmedName,
      icon: iconToUse,
      defaultVal: formattedCost,
      freq,
      isCustom: true,
    });

    haptics.success();
    // Reset form
    setName('');
    setCost('');
    setCustomEmoji('');
    setError(null);
  };

  const customCategories = categories.filter((c) => c.isCustom);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-5">
      <div className="flex h-full max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-[#262c3b] bg-[#12151d] shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#212634] px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
              <Tag className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Gerenciar Sugestões & Categorias</h3>
              <p className="text-xs text-neutral-400">
                Cadastre novos hábitos recorrentes com custo e frequência padrão
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              haptics.tap();
              onClose();
            }}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-[#1e2330] hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Form: Cadastrar Nova Categoria */}
          <form
            onSubmit={handleCreate}
            className="rounded-xl border border-emerald-500/30 bg-[#171b26] p-4 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Plus className="h-4 w-4" />
                <span>Nova Sugestão Personalizada</span>
              </h4>
            </div>

            {/* Nome do hábito */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Nome do hábito / gasto
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Ex: Doces na confeitaria, Estacionamento rotativo, Energético..."
                className="w-full rounded-xl border border-[#2b3342] bg-[#12141c] px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                maxLength={40}
              />
            </div>

            {/* Seletor de Emoji / Ícone */}
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Ícone / Emoji
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2 max-h-24 overflow-y-auto p-1 bg-[#12141c] rounded-xl border border-[#262c3b]">
                {PRESET_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      haptics.tap();
                      setSelectedEmoji(emoji);
                      setCustomEmoji('');
                    }}
                    className={`h-8 w-8 rounded-lg text-base flex items-center justify-center transition-all ${
                      selectedEmoji === emoji && !customEmoji
                        ? 'bg-emerald-500/30 border border-emerald-400 scale-110'
                        : 'hover:bg-[#202532] text-neutral-300'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-neutral-400">Ou digite outro emoji:</span>
                <input
                  type="text"
                  value={customEmoji}
                  onChange={(e) => setCustomEmoji(e.target.value)}
                  placeholder="Ex: 🍩"
                  maxLength={4}
                  className="w-20 rounded-lg border border-[#2b3342] bg-[#12141c] px-2 py-1 text-center text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Grid: Custo padrão e Frequência */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Custo padrão a cada vez (R$)
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-emerald-400">
                    R$
                  </span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={cost}
                    onChange={(e) => {
                      const t = e.target.value;
                      if (/^[0-9.,]*$/.test(t)) {
                        setCost(t);
                        if (error) setError(null);
                      }
                    }}
                    placeholder="0,00"
                    className="w-full rounded-xl border border-[#2b3342] bg-[#12141c] py-2.5 pl-9 pr-3 font-mono-numbers text-sm font-bold text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">
                  Frequência padrão
                </label>
                <div className="grid grid-cols-3 gap-1 rounded-xl border border-[#2b3342] bg-[#12141c] p-1">
                  {(
                    [
                      { id: 'diario', label: 'Diário' },
                      { id: 'semanal', label: 'Semanal' },
                      { id: 'mensal', label: 'Mensal' },
                    ] as const
                  ).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        haptics.tap();
                        setFreq(item.id);
                      }}
                      className={`rounded-lg py-1.5 text-center text-xs font-semibold transition-all ${
                        freq === item.id
                          ? 'bg-emerald-500 text-[#0c0e12]'
                          : 'text-neutral-400 hover:text-white hover:bg-[#1c212f]'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 p-2.5 text-xs text-red-300">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-2.5 px-4 text-xs font-bold text-[#0c0e12] hover:bg-emerald-400 transition-colors shadow-md shadow-emerald-500/20"
            >
              <Plus className="h-4 w-4" />
              <span>Salvar e Adicionar às Sugestões</span>
            </button>
          </form>

          {/* Categorias cadastradas */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3 flex items-center justify-between">
              <span>Sugestões Criadas por Você ({customCategories.length})</span>
            </h4>

            {customCategories.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#262c3b] bg-[#141720] p-6 text-center text-neutral-500 text-xs">
                Nenhuma sugestão personalizada criada ainda. Use o formulário acima para cadastrar seus gastos habituais!
              </div>
            ) : (
              <div className="space-y-2">
                {customCategories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between rounded-xl border border-[#232938] bg-[#171a24] p-3 transition-colors hover:border-[#333d52]"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{cat.icon}</span>
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-white">{cat.label}</p>
                        <p className="text-[11px] text-neutral-400 font-mono-numbers">
                          R$ {cat.defaultVal} • <span className="capitalize">{cat.freq}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          haptics.success();
                          onSelectAndApply(cat);
                          onClose();
                        }}
                        className="rounded-lg bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 text-xs font-semibold text-emerald-300 hover:bg-emerald-500 hover:text-[#0c0e12] transition-colors"
                      >
                        Usar no cálculo
                      </button>
                      <button
                        onClick={() => {
                          haptics.tap();
                          onDeleteCategory(cat.id);
                        }}
                        className="rounded-lg p-1.5 text-neutral-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                        title="Excluir sugestão"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
