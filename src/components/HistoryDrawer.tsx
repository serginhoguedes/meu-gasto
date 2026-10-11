import React, { useState, useEffect, useRef } from 'react';
import { CalculationResult, SuggestionCategory } from '../types';
import { formatCurrency, formatDate, getFrequencyLabel } from '../utils/formatters';
import { haptics } from '../utils/haptics';
import {
  X,
  Trash2,
  History,
  ChevronRight,
  Download,
  Upload,
  CheckSquare,
  Square,
  CheckCircle2,
} from 'lucide-react';

interface HistoryDrawerProps {
  history: CalculationResult[];
  categories?: SuggestionCategory[];
  isOpen: boolean;
  onClose: () => void;
  onDeleteItem: (id: string) => void;
  onClearAll: () => void;
  onSelectCalculation: (calc: CalculationResult) => void;
  onRestoreBackup: (data: { history: CalculationResult[]; categories?: SuggestionCategory[] }) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  history,
  categories = [],
  isOpen,
  onClose,
  onDeleteItem,
  onClearAll,
  onSelectCalculation,
  onRestoreBackup,
}) => {
  const [confirmClear, setConfirmClear] = useState<boolean>(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set(history.map((h) => h.id)));
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync selected IDs when history changes
  useEffect(() => {
    setSelectedIds((prev) => {
      const next = new Set<string>();
      history.forEach((h) => {
        // keep previous state if it was in history, otherwise default to selected
        if (prev.has(h.id) || prev.size === 0) {
          next.add(h.id);
        }
      });
      return next;
    });
  }, [history]);

  if (!isOpen) return null;

  const toggleSelect = (id: string) => {
    haptics.tap();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    haptics.tap();
    setSelectedIds(new Set(history.map((h) => h.id)));
  };

  const deselectAll = () => {
    haptics.tap();
    setSelectedIds(new Set());
  };

  const selectedItems = history.filter((item) => selectedIds.has(item.id));
  const combinedAnnual = selectedItems.reduce((sum, item) => sum + item.annualValue, 0);
  const combinedMonthly = combinedAnnual / 12;
  const combinedSavings = selectedItems.reduce((sum, item) => sum + item.annualSavings, 0);

  // Backup Export
  const handleExportBackup = () => {
    haptics.tap();
    const backupData = {
      app: 'meus-gastos',
      version: 1,
      exportedAt: new Date().toISOString(),
      history,
      categories,
    };
    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meus-gastos-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Backup Restore
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed.history)) {
          haptics.success();
          onRestoreBackup({
            history: parsed.history,
            categories: Array.isArray(parsed.categories) ? parsed.categories : undefined,
          });
        }
      } catch (err) {
        console.error('Erro ao restaurar backup:', err);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm">
      <div className="flex h-full w-full max-w-md flex-col border-l border-[#242a38] bg-[#12141c] shadow-2xl">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-[#212634] p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">Histórico de Cálculos</h2>
            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-bold text-emerald-400">
              {history.length}
            </span>
          </div>
          <button
            onClick={() => {
              haptics.tap();
              onClose();
            }}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-[#1f2430] hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Totalizador Combinado Interativo com Seleção */}
        {history.length > 0 && (
          <div className="border-b border-[#212634] bg-[#161a24] p-4">
            <div className="flex items-center justify-between mb-1.5 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Soma dos Hábitos Selecionados ({selectedItems.length}/{history.length})</span>
              </span>
              <button
                type="button"
                onClick={selectedItems.length === history.length ? deselectAll : selectAll}
                className="text-neutral-400 hover:text-white underline text-[10px]"
              >
                {selectedItems.length === history.length ? 'Desmarcar todos' : 'Marcar todos'}
              </button>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="font-mono-numbers text-2xl font-black text-emerald-400">
                {formatCurrency(combinedAnnual)}
              </span>
              <span className="text-xs font-semibold text-neutral-400">/ ano somados</span>
            </div>

            <div className="mt-2 flex items-center justify-between text-xs text-neutral-300">
              <span>Equivale a: <strong className="text-white">{formatCurrency(combinedMonthly)}/mês</strong></span>
              <span className="text-emerald-400">
                Pode poupar: <strong>{formatCurrency(combinedSavings)}/ano</strong>
              </span>
            </div>
          </div>
        )}

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-center p-6">
              <div className="rounded-full bg-[#1c212c] p-4 text-neutral-500 mb-3">
                <History className="h-8 w-8" />
              </div>
              <p className="text-sm font-semibold text-neutral-300">Nenhum cálculo salvo ainda</p>
              <p className="text-xs text-neutral-500 mt-1 max-w-xs">
                Calcule o impacto de cafés, delivery ou qualquer outro hábito e eles serão salvos localmente aqui no seu dispositivo.
              </p>
            </div>
          ) : (
            history.map((item) => {
              const isSelected = selectedIds.has(item.id);
              return (
                <div
                  key={item.id}
                  className={`group relative rounded-xl border p-3.5 transition-all ${
                    isSelected
                      ? 'border-emerald-500/40 bg-[#171b26]'
                      : 'border-[#232938] bg-[#141720] opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2.5">
                    {/* Checkbox para inclusão na soma */}
                    <button
                      type="button"
                      onClick={() => toggleSelect(item.id)}
                      className="mt-0.5 text-neutral-400 hover:text-emerald-400 transition-colors"
                      title={isSelected ? 'Desmarcar da soma combinada' : 'Marcar para somar no total'}
                    >
                      {isSelected ? (
                        <CheckSquare className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <Square className="h-4 w-4 text-neutral-500" />
                      )}
                    </button>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-sm">{item.name}</h4>
                        <span className="rounded bg-[#212735] px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                          {getFrequencyLabel(item.frequency)}
                        </span>
                      </div>

                      <p className="text-xs text-neutral-400 mt-0.5">
                        {formatCurrency(item.value)} a cada {getFrequencyLabel(item.frequency).toLowerCase()}
                      </p>

                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="font-mono-numbers text-base font-bold text-emerald-400">
                          {formatCurrency(item.annualValue)}
                        </span>
                        <span className="text-[11px] text-neutral-400">/ ano</span>
                        <span className="text-[11px] text-neutral-500">
                          ({formatCurrency(item.monthlyValue)}/mês)
                        </span>
                      </div>

                      <div className="mt-2 text-[10px] text-neutral-500">
                        {formatDate(item.timestamp)}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col items-end gap-2">
                      <button
                        onClick={() => {
                          haptics.tap();
                          onDeleteItem(item.id);
                        }}
                        title="Excluir este cálculo"
                        className="rounded-lg p-1.5 text-neutral-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => {
                          haptics.tap();
                          onSelectCalculation(item);
                          onClose();
                        }}
                        title="Recarregar este cálculo"
                        className="flex items-center gap-1 rounded-lg border border-[#2c3445] bg-[#1f2432] px-2 py-1 text-[11px] font-medium text-neutral-300 hover:border-emerald-500/50 hover:text-emerald-300"
                      >
                        <span>Abrir</span>
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer com Backup & Exclusão */}
        <div className="border-t border-[#212634] p-4 bg-[#141721] space-y-2.5">
          {/* Backup offline: Exportar / Restaurar */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportBackup}
              disabled={history.length === 0}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-[#2a3242] bg-[#1a1f2b] py-2 px-3 text-xs font-semibold text-neutral-300 hover:border-emerald-500/40 hover:text-white transition-colors disabled:opacity-40"
              title="Baixar arquivo .json de backup com todos os hábitos salvos"
            >
              <Download className="h-3.5 w-3.5 text-emerald-400" />
              <span>Exportar Backup</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-[#2a3242] bg-[#1a1f2b] py-2 px-3 text-xs font-semibold text-neutral-300 hover:border-emerald-500/40 hover:text-white transition-colors"
              title="Carregar arquivo .json de backup anterior"
            >
              <Upload className="h-3.5 w-3.5 text-emerald-400" />
              <span>Restaurar Backup</span>
            </button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json,application/json"
              className="hidden"
            />
          </div>

          {/* Limpar Histórico */}
          {history.length > 0 && (
            <div>
              {confirmClear ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      haptics.tap();
                      onClearAll();
                      setConfirmClear(false);
                    }}
                    className="flex-1 rounded-xl bg-red-600 py-2 px-3 text-xs font-bold text-white hover:bg-red-500 transition-colors"
                  >
                    Sim, limpar tudo
                  </button>
                  <button
                    onClick={() => setConfirmClear(false)}
                    className="rounded-xl border border-[#2e3748] bg-[#1f2430] py-2 px-3 text-xs font-semibold text-neutral-300 hover:text-white"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmClear(true)}
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-[#2d3445] bg-[#181c26] py-2 px-3 text-xs font-semibold text-neutral-400 hover:border-red-500/40 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Limpar Todo o Histórico</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
