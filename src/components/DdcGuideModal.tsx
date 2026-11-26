import React, { useEffect } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { DDC_CATEGORIES, DdcCode } from '../data/libraryData';

interface DdcGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDdc: (code: DdcCode) => void;
}

export const DdcGuideModal: React.FC<DdcGuideModalProps> = ({
  isOpen,
  onClose,
  onSelectDdc,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/35 backdrop-blur-[2px] p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="ddc-guide-title"
    >
      <div className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl bg-white border border-zinc-200 shadow-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 shrink-0">
          <div>
            <h2 id="ddc-guide-title" className="text-base font-semibold text-zinc-900">
              Cara Mudah Membaca Klasifikasi DDC
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Dewey Decimal Classification membagi seluruh buku menjadi 10 rak utama (000–900).
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup panduan"
            className="p-2 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4">
          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/70 text-xs text-zinc-600 leading-relaxed">
            <strong className="text-zinc-900 font-semibold">Tips cepat untuk non-pustakawan:</strong>{' '}
            Kamu tidak perlu menghafal kode perpustakaan. Cukup lihat 3 angka pertama di label buku (misalnya{' '}
            <span className="font-mono text-zinc-900">158.1</span> masuk ke rak{' '}
            <span className="font-mono text-zinc-900">100</span> Psikologi & Mindset), lalu cocokan warna pastel raknya.
          </div>

          <div className="divide-y divide-zinc-100 border border-zinc-200/80 rounded-xl overflow-hidden">
            {DDC_CATEGORIES.map((cat) => (
              <button
                key={cat.code}
                type="button"
                onClick={() => {
                  onSelectDdc(cat.code);
                  onClose();
                }}
                className="w-full px-4 py-3.5 flex items-center justify-between gap-4 text-left bg-white hover:bg-zinc-50 transition-colors cursor-pointer group"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <span
                    className={`w-12 py-1.5 rounded-lg ${cat.pastelBg} border ${cat.pastelBorder} font-mono text-xs font-semibold text-zinc-900 text-center shrink-0 tabular-nums`}
                  >
                    {cat.code}
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span className="text-sm font-semibold text-zinc-900">
                        {cat.title}
                      </span>
                      <span className="text-xs text-zinc-400">
                        · Istilah baku: {cat.formalName}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-0.5 truncate">
                      Contoh isi rak: {cat.examples}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-800 transition-colors shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
