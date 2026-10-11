import React from 'react';
import { History, ShieldCheck } from 'lucide-react';
import { haptics } from '../utils/haptics';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  historyCount: number;
  onOpenHistory: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  historyCount,
  onOpenHistory,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-[#1f242e] bg-[#0f1116]/90 backdrop-blur-md px-4 py-3 sm:px-6">
      <div className="mx-auto flex max-w-4xl items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 shadow-md shadow-emerald-500/20 text-[#0c0e12] font-black text-xl select-none">
            $
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white sm:text-xl">
                Meus Gastos
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 rounded bg-[#17231d] px-2 py-0.5 text-[11px] font-medium text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="h-3 w-3" /> 100% Offline
              </span>
            </div>
            <p className="text-xs text-neutral-400 hidden xs:block">
              Calculadora de impacto dos pequenos gastos
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Botão de Instalar no Celular (Android / iOS) */}
          <PWAInstallButton />

          <button
            onClick={() => {
              haptics.tap();
              onOpenHistory();
            }}
            className="relative flex items-center gap-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 text-xs font-semibold text-emerald-300 transition-all hover:bg-emerald-500 hover:text-[#0c0e12]"
          >
            <History className="h-3.5 w-3.5" />
            <span>Histórico</span>
            {historyCount > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-bold text-[#0c0e12]">
                {historyCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

