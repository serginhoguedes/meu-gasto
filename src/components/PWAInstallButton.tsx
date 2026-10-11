import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X, Share, PlusSquare, ArrowUpRight } from 'lucide-react';
import { haptics } from '../utils/haptics';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  // If already installed and running standalone, do not show
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = () => {
    haptics.tap();
    if (isInstallable) {
      install();
    } else {
      setShowGuide(true);
    }
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        className="flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500 hover:text-[#0c0e12] transition-all shadow-sm"
        title="Instalar Meus Gastos no seu celular"
      >
        <Download className="h-3.5 w-3.5" />
        <span>Instalar no Celular</span>
      </button>

      {/* Modal Guia de Instalação (para iPhone iOS ou navegadores que não suportam prompt direto) */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-[#272e3d] bg-[#13161f] p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#212634] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                  <Smartphone className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Como Instalar o App</h3>
                  <p className="text-[11px] text-neutral-400">
                    {isIOS ? 'No iPhone (iOS Safari)' : 'No seu Celular'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="rounded-lg p-1 text-neutral-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {isIOS ? (
              <div className="space-y-3.5 text-xs text-neutral-300">
                <div className="flex items-start gap-3 rounded-xl bg-[#181c26] p-3 border border-[#232938]">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs">
                    1
                  </div>
                  <div>
                    <p className="font-semibold text-white">Toque em Compartilhar</p>
                    <p className="text-neutral-400 text-[11px] mt-0.5 flex items-center gap-1">
                      No Safari, toque no ícone <Share className="h-3 w-3 inline text-emerald-400" /> na barra inferior.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl bg-[#181c26] p-3 border border-[#232938]">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs">
                    2
                  </div>
                  <div>
                    <p className="font-semibold text-white">Adicionar à Tela de Início</p>
                    <p className="text-neutral-400 text-[11px] mt-0.5 flex items-center gap-1">
                      Role para baixo e selecione <PlusSquare className="h-3 w-3 inline text-emerald-400" /> <strong>"Adicionar à Tela de Início"</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl bg-[#181c26] p-3 border border-[#232938]">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs">
                    3
                  </div>
                  <div>
                    <p className="font-semibold text-white">Pronto!</p>
                    <p className="text-neutral-400 text-[11px] mt-0.5">
                      Toque em <strong>"Adicionar"</strong> no canto superior. O ícone de <strong>Meus Gastos</strong> estará na sua tela inicial!
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs text-neutral-300">
                <p>
                  No Chrome para Android: toque nos <strong>3 pontinhos (⋮)</strong> no canto superior do navegador e selecione:
                </p>
                <div className="rounded-xl bg-[#181c26] p-3 border border-[#232938] text-center font-bold text-emerald-300">
                  "Instalar aplicativo" ou "Adicionar à tela inicial"
                </div>
                <p className="text-[11px] text-neutral-400">
                  O aplicativo funcionará em tela cheia como um app nativo, rápido e 100% offline!
                </p>
              </div>
            )}

            <button
              onClick={() => setShowGuide(false)}
              className="mt-4 w-full rounded-xl bg-emerald-500 py-2.5 text-xs font-bold text-[#0c0e12] hover:bg-emerald-400 transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};
