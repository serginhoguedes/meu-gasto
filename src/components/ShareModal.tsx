import React, { useState, useEffect } from 'react';
import { CalculationResult } from '../types';
import { formatCurrency, getFrequencyLabel } from '../utils/formatters';
import { generateImpactCardDataUrl } from '../utils/canvasCard';
import { haptics } from '../utils/haptics';
import {
  X,
  Copy,
  Check,
  Download,
  Share2,
  FileText,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react';

interface ShareModalProps {
  result: CalculationResult | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  result,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'text' | 'image'>('text');
  const [copied, setCopied] = useState<boolean>(false);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && result && activeTab === 'image' && !imageDataUrl) {
      setIsGeneratingImage(true);
      generateImpactCardDataUrl(result)
        .then((url) => setImageDataUrl(url))
        .catch((err) => console.error('Erro gerando imagem:', err))
        .finally(() => setIsGeneratingImage(false));
    }
  }, [isOpen, result, activeTab, imageDataUrl]);

  // Reset image when result changes
  useEffect(() => {
    setImageDataUrl(null);
  }, [result?.id]);

  if (!isOpen || !result) return null;

  const shareText = `💸 Quanto custa meu hábito: *${result.name}*?
Valor: ${formatCurrency(result.value)} (${getFrequencyLabel(result.frequency)})

🚨 IMPACTO ANUAL: ${formatCurrency(result.annualValue)} por ano!
📅 Por mês: ${formatCurrency(result.monthlyValue)}
📅 Por semana: ${formatCurrency(result.weeklyValue)}

💡 Meta de Redução (${result.reductionPercentage}%):
Economia anual de ${formatCurrency(result.annualSavings)} no bolso!

Calculado no app "Meus Gastos" (100% Offline e Privado)`;

  const handleCopyText = async () => {
    haptics.tap();
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = shareText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeShareText = async () => {
    haptics.tap();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Meus Gastos - Impacto de ${result.name}`,
          text: shareText,
        });
      } catch (err) {
        // User cancelled or share failed
      }
    } else {
      handleCopyText();
    }
  };

  const handleDownloadImage = () => {
    if (!imageDataUrl) return;
    haptics.tap();
    const link = document.createElement('a');
    link.download = `meus-gastos-${result.name.toLowerCase().replace(/\s+/g, '-')}.png`;
    link.href = imageDataUrl;
    link.click();
  };

  const handleNativeShareImage = async () => {
    if (!imageDataUrl) return;
    haptics.tap();

    try {
      const blob = await (await fetch(imageDataUrl)).blob();
      const file = new File([blob], 'meus-gastos-impacto.png', { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Meus Gastos - Impacto Financeiro',
          text: `Olha só quanto custa ${result.name} por ano: ${formatCurrency(result.annualValue)}!`,
        });
        return;
      }
    } catch {
      // Fallback to download
    }

    handleDownloadImage();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-[#262c39] bg-[#141720] shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#212634] px-5 py-4">
          <div className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-emerald-400" />
            <h3 className="font-bold text-white text-base">Compartilhar Resultado</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-[#202532] hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab switch: Texto vs Imagem */}
        <div className="border-b border-[#212634] px-5 pt-3">
          <div className="flex gap-4">
            <button
              onClick={() => {
                haptics.tap();
                setActiveTab('text');
              }}
              className={`flex items-center gap-2 pb-3 text-xs font-semibold border-b-2 transition-all ${
                activeTab === 'text'
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-neutral-400 hover:text-white'
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>Mensagem de Texto</span>
            </button>
            <button
              onClick={() => {
                haptics.tap();
                setActiveTab('image');
              }}
              className={`flex items-center gap-2 pb-3 text-xs font-semibold border-b-2 transition-all ${
                activeTab === 'image'
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-neutral-400 hover:text-white'
              }`}
            >
              <ImageIcon className="h-4 w-4" />
              <span>Cartão Visual em Imagem</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 max-h-[70vh] overflow-y-auto">
          {activeTab === 'text' ? (
            <div>
              <p className="text-xs text-neutral-400 mb-3">
                Envie o resumo do impacto para amigos, familiares ou salve nas suas notas:
              </p>
              <div className="rounded-xl border border-[#262c3a] bg-[#1a1e28] p-4 text-xs font-mono text-neutral-200 whitespace-pre-wrap leading-relaxed select-all">
                {shareText}
              </div>

              <div className="mt-4 flex flex-col sm:flex-row gap-2.5">
                <button
                  onClick={handleCopyText}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#2e3748] bg-[#1e2330] py-3 px-4 text-xs font-bold text-white hover:border-emerald-500/50 hover:bg-[#252b3b] transition-all"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-400" />
                      <span className="text-emerald-400">Copiado para a área de transferência!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 text-neutral-400" />
                      <span>Copiar Texto</span>
                    </>
                  )}
                </button>

                {typeof navigator !== 'undefined' && 'share' in navigator && (
                  <button
                    onClick={handleNativeShareText}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 px-4 text-xs font-bold text-[#0c0e12] hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/20"
                  >
                    <Share2 className="h-4 w-4" />
                    <span>Compartilhar Agora</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div>
              <p className="text-xs text-neutral-400 mb-3">
                Cartão de impacto em alta resolução pronto para WhatsApp, Stories e redes:
              </p>

              {isGeneratingImage || !imageDataUrl ? (
                <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-[#262c3a] bg-[#1a1e28] text-neutral-400">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-400 mb-2" />
                  <span className="text-xs">Gerando imagem em alta resolução...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="overflow-hidden rounded-xl border border-[#2b3342] shadow-lg max-h-72 flex justify-center bg-black">
                    <img
                      src={imageDataUrl}
                      alt="Cartão de impacto financeiro"
                      className="max-h-72 object-contain"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <button
                      onClick={handleDownloadImage}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 px-4 text-xs font-bold text-[#0c0e12] hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/20"
                    >
                      <Download className="h-4 w-4" />
                      <span>Baixar Imagem (.png)</span>
                    </button>

                    <button
                      onClick={handleNativeShareImage}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#2e3748] bg-[#1e2330] py-3 px-4 text-xs font-bold text-white hover:border-emerald-500/50 hover:bg-[#252b3b] transition-all"
                    >
                      <Share2 className="h-4 w-4" />
                      <span>Compartilhar Imagem</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
