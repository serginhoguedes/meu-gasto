import React, { useState, useEffect } from 'react';
import { CalculationResult, Frequency, SuggestionCategory } from './types';
import { calculateImpact, parseCurrencyInput } from './utils/formatters';
import { Header } from './components/Header';
import { ExpenseForm } from './components/ExpenseForm';
import { ResultCards } from './components/ResultCards';
import { ReductionGoal } from './components/ReductionGoal';
import { HistoryDrawer } from './components/HistoryDrawer';
import { ShareModal } from './components/ShareModal';
import { CategoryModal } from './components/CategoryModal';
import { Sparkles, CheckCircle2 } from 'lucide-react';

const STORAGE_KEY_HISTORY = 'meu_dinheiro_history_v1';
const STORAGE_KEY_LAST_CALC = 'meu_dinheiro_last_calc_v1';
const STORAGE_KEY_CATEGORIES = 'meu_dinheiro_categories_v1';

const DEFAULT_CATEGORIES: SuggestionCategory[] = [
  { id: 'cat_cafe', label: 'Café expresso', icon: '☕', defaultVal: '6,50', freq: 'diario' },
  { id: 'cat_delivery', label: 'Delivery / iFood', icon: '🛵', defaultVal: '45,00', freq: 'semanal' },
  { id: 'cat_lanche', label: 'Lanche da tarde', icon: '🥪', defaultVal: '15,00', freq: 'diario' },
  { id: 'cat_cigarro', label: 'Cigarro / Pod', icon: '🚬', defaultVal: '14,00', freq: 'diario' },
  { id: 'cat_cerveja', label: 'Cerveja fim de semana', icon: '🍺', defaultVal: '50,00', freq: 'semanal' },
  { id: 'cat_transporte', label: 'Transporte por app', icon: '🚗', defaultVal: '28,00', freq: 'diario' },
  { id: 'cat_streaming', label: 'Streaming / Assinaturas', icon: '📺', defaultVal: '49,90', freq: 'mensal' },
];

export default function App() {
  const [history, setHistory] = useState<CalculationResult[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load history:', e);
    }
    // Default initial example
    return [
      {
        id: 'init_cafe',
        name: 'Café expresso com pão de queijo',
        value: 9.5,
        frequency: 'diario',
        annualValue: 9.5 * 365,
        monthlyValue: (9.5 * 365) / 12,
        weeklyValue: (9.5 * 365) / 52,
        dailyValue: 9.5,
        reductionPercentage: 50,
        annualSavings: (9.5 * 365) * 0.5,
        reducedAnnualValue: (9.5 * 365) * 0.5,
        timestamp: Date.now() - 3600000,
      },
    ];
  });

  const [currentResult, setCurrentResult] = useState<CalculationResult | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LAST_CALC);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      // ignore
    }
    return {
      id: 'init_cafe',
      name: 'Café expresso com pão de queijo',
      value: 9.5,
      frequency: 'diario',
      annualValue: 9.5 * 365,
      monthlyValue: (9.5 * 365) / 12,
      weeklyValue: (9.5 * 365) / 52,
      dailyValue: 9.5,
      reductionPercentage: 50,
      annualSavings: (9.5 * 365) * 0.5,
      reducedAnnualValue: (9.5 * 365) * 0.5,
      timestamp: Date.now(),
    };
  });

  // Form reload state
  const [formKey, setFormKey] = useState<number>(1);
  const [formInitialName, setFormInitialName] = useState<string>('Café expresso com pão de queijo');
  const [formInitialValue, setFormInitialValue] = useState<number>(9.5);
  const [formInitialFreq, setFormInitialFreq] = useState<Frequency>('diario');

  // Categorias cadastradas com custo
  const [categories, setCategories] = useState<SuggestionCategory[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CATEGORIES);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load categories:', e);
    }
    return DEFAULT_CATEGORIES;
  });

  // Modals & UI states
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isShareOpen, setIsShareOpen] = useState<boolean>(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync categories to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
    } catch (e) {
      console.error('Failed to save categories:', e);
    }
  }, [categories]);

  // Sync history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
    } catch (e) {
      console.error('Failed to save history:', e);
    }
  }, [history]);

  // Sync last calculation
  useEffect(() => {
    if (currentResult) {
      try {
        localStorage.setItem(STORAGE_KEY_LAST_CALC, JSON.stringify(currentResult));
      } catch (e) {
        // ignore
      }
    }
  }, [currentResult]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddCategory = (newCat: Omit<SuggestionCategory, 'id'>) => {
    const cat: SuggestionCategory = {
      ...newCat,
      id: `cat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };
    setCategories((prev) => [cat, ...prev]);
    handleSelectAndApplyCategory(cat);
    showToast(`Categoria "${cat.label}" salva com custo R$ ${cat.defaultVal}!`);
  };

  const handleDeleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    showToast('Categoria removida.');
  };

  const handleSelectAndApplyCategory = (cat: SuggestionCategory) => {
    const parsed = parseCurrencyInput(cat.defaultVal);
    setFormInitialName(cat.label);
    setFormInitialValue(parsed);
    setFormInitialFreq(cat.freq);
    setFormKey((k) => k + 1);
  };

  const handleCalculate = (name: string, value: number, frequency: Frequency) => {
    const defaultReduction = currentResult?.reductionPercentage || 50;
    const result = calculateImpact(name, value, frequency, defaultReduction);
    setCurrentResult(result);

    // Save into history (avoid duplicate consecutive records)
    setHistory((prev) => {
      const filtered = prev.filter(
        (item) => !(item.name.toLowerCase() === result.name.toLowerCase() && item.value === result.value && item.frequency === result.frequency)
      );
      return [result, ...filtered];
    });

    showToast(`Calculado: ${result.name} (${formatCurrency(result.annualValue)}/ano)`);
  };

  const handleClear = () => {
    setCurrentResult(null);
    setFormInitialName('');
    setFormInitialValue(0);
    setFormInitialFreq('diario');
    setFormKey((k) => k + 1);
    try {
      localStorage.removeItem(STORAGE_KEY_LAST_CALC);
    } catch {
      // ignore
    }
  };

  const handleUpdatePercentage = (pct: number) => {
    if (!currentResult) return;
    const annualSavings = currentResult.annualValue * (pct / 100);
    const reducedAnnualValue = currentResult.annualValue - annualSavings;

    const updated: CalculationResult = {
      ...currentResult,
      reductionPercentage: pct,
      annualSavings,
      reducedAnnualValue,
    };
    setCurrentResult(updated);

    // Update in history as well
    setHistory((prev) =>
      prev.map((item) => (item.id === currentResult.id ? updated : item))
    );
  };

  const handleDeleteHistoryItem = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
    showToast('Item removido do histórico.');
  };

  const handleClearAllHistory = () => {
    setHistory([]);
    showToast('Histórico limpo com sucesso.');
  };

  const handleSelectCalculation = (calc: CalculationResult) => {
    setCurrentResult(calc);
    setFormInitialName(calc.name);
    setFormInitialValue(calc.value);
    setFormInitialFreq(calc.frequency);
    setFormKey((k) => k + 1);
    showToast(`Carregado: ${calc.name}`);
  };

  const handleRestoreBackup = (data: { history: CalculationResult[]; categories?: SuggestionCategory[] }) => {
    if (data.history && Array.isArray(data.history)) {
      setHistory(data.history);
      if (data.history.length > 0) {
        setCurrentResult(data.history[0]);
      }
    }
    if (data.categories && Array.isArray(data.categories)) {
      setCategories(data.categories);
    }
    showToast('Backup restaurado com sucesso!');
  };

  return (
    <div className="min-h-screen bg-[#0a0c0f] text-neutral-100 flex flex-col">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full border border-emerald-500/40 bg-[#151a24] px-4 py-2.5 text-xs font-semibold text-emerald-300 shadow-xl flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="w-full max-w-2xl mx-auto flex flex-col flex-1">
        {/* App Header (apenas logo e botão Histórico) */}
        <Header
          historyCount={history.length}
          onOpenHistory={() => setIsHistoryOpen(true)}
        />

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-5 space-y-5">
          {/* Tagline discreta */}
          <div className="flex items-center justify-between rounded-xl bg-[#141720] border border-[#202635] p-3 text-xs text-neutral-300">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                Pequenos gastos invisíveis acumulam milhares de reais no ano.
              </span>
            </div>
            <span className="text-[11px] font-semibold text-emerald-400 hidden xs:inline">
              100% Offline
            </span>
          </div>

          {/* Form */}
          <ExpenseForm
            key={formKey}
            categories={categories}
            onOpenManageCategories={() => setIsCategoryModalOpen(true)}
            initialName={formInitialName}
            initialValue={formInitialValue}
            initialFrequency={formInitialFreq}
            onCalculate={handleCalculate}
            onClear={handleClear}
          />

          {/* Results section */}
          {currentResult ? (
            <div className="space-y-5">
              {/* Impact Cards */}
              <ResultCards
                result={currentResult}
                onOpenShare={() => setIsShareOpen(true)}
              />

              {/* Reduction Goal Comparator */}
              <ReductionGoal
                result={currentResult}
                onUpdatePercentage={handleUpdatePercentage}
              />
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#283042] bg-[#12151e]/50 p-8 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1a1f2c] text-emerald-400">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-white">Nenhum cálculo ativo</h3>
              <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
                Selecione uma sugestão acima ou digite seu gasto e toque em{' '}
                <strong className="text-emerald-400">"CALCULAR IMPACTO"</strong>.
              </p>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-[#1a1e28] bg-[#0c0e12] px-4 py-4 text-center text-xs text-neutral-500 mt-auto">
          <p>
            <strong>Meus Gastos</strong> — Educação & Consciência Financeira.
          </p>
          <p className="text-[11px] text-neutral-600 mt-0.5">
            100% no seu aparelho • Sem login • Sem internet
          </p>
        </footer>
      </div>

      {/* Drawers and Modals */}
      <HistoryDrawer
        history={history}
        categories={categories}
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onDeleteItem={handleDeleteHistoryItem}
        onClearAll={handleClearAllHistory}
        onSelectCalculation={handleSelectCalculation}
        onRestoreBackup={handleRestoreBackup}
      />

      <ShareModal
        result={currentResult}
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
        onSelectAndApply={handleSelectAndApplyCategory}
      />
    </div>
  );
}

function formatCurrency(val: number): string {
  if (isNaN(val)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(val);
}
