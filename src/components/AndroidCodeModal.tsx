import React, { useState } from 'react';
import { ANDROID_PROJECT_FILES, AndroidFile } from '../utils/androidCode';
import { haptics } from '../utils/haptics';
import {
  X,
  Copy,
  Check,
  FileCode,
  Download,
  Terminal,
  Smartphone,
  ExternalLink,
} from 'lucide-react';

interface AndroidCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidCodeModal: React.FC<AndroidCodeModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedFile, setSelectedFile] = useState<AndroidFile>(ANDROID_PROJECT_FILES[0]);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    haptics.tap();
    try {
      await navigator.clipboard.writeText(selectedFile.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleDownloadSingle = () => {
    haptics.tap();
    const blob = new Blob([selectedFile.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = selectedFile.name;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-3 sm:p-6">
      <div className="flex h-full max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-[#262c3b] bg-[#11131a] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#202534] px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
              <Smartphone className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                Código Nativo Android (Kotlin + Jetpack Compose)
              </h3>
              <p className="text-xs text-neutral-400">
                Arquivos 100% nativos prontos para compilar no Android Studio
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              haptics.tap();
              onClose();
            }}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-[#1e2330] hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* File Tabs */}
        <div className="flex overflow-x-auto border-b border-[#202534] bg-[#141722] px-4 pt-2">
          {ANDROID_PROJECT_FILES.map((file) => {
            const isSelected = selectedFile.name === file.name;
            return (
              <button
                key={file.name}
                onClick={() => {
                  haptics.tap();
                  setSelectedFile(file);
                }}
                className={`flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-semibold transition-all ${
                  isSelected
                    ? 'border-emerald-500 text-emerald-400 bg-[#191e2b]'
                    : 'border-transparent text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <FileCode className="h-3.5 w-3.5" />
                <span>{file.name}</span>
              </button>
            );
          })}
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between border-b border-[#202534] bg-[#161a25] px-4 py-2 text-xs text-neutral-400">
          <span className="font-mono text-[11px] truncate max-w-sm">
            {selectedFile.path}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadSingle}
              className="flex items-center gap-1 rounded-lg border border-[#2b3344] bg-[#1c212f] px-2.5 py-1 text-xs text-neutral-300 hover:text-white"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Baixar {selectedFile.name}</span>
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 text-xs font-semibold text-emerald-300 hover:bg-emerald-500 hover:text-[#0c0e12] transition-colors"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copiar Código</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div className="flex-1 overflow-auto bg-[#0a0c10] p-4 font-mono text-xs text-emerald-100/90 leading-relaxed">
          <pre className="select-all whitespace-pre-wrap font-mono">
            {selectedFile.code}
          </pre>
        </div>

        {/* Footer instructions */}
        <div className="border-t border-[#202534] bg-[#141722] p-3 sm:p-4 text-xs text-neutral-400 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>
              Para rodar no Android Studio: Crie um projeto <strong>Empty Activity (Compose)</strong>, pacote <code className="text-emerald-300">com.meudinheiro.app</code> e cole os arquivos.
            </span>
          </div>
          <span className="text-[11px] text-neutral-500">
            Arquitetura: MVVM + Jetpack Compose + Room Local
          </span>
        </div>
      </div>
    </div>
  );
};
