import React, { useEffect } from 'react';
import { X, BookOpen } from 'lucide-react';
import { Book, BorrowRecord, DDC_CATEGORIES } from '../data/libraryData';

interface BookDetailModalProps {
  book: Book | null;
  activeRecords: BorrowRecord[];
  onClose: () => void;
  onBorrowClick: (bookId: number) => void;
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({
  book,
  activeRecords,
  onClose,
  onBorrowClick,
}) => {
  useEffect(() => {
    if (!book) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [book, onClose]);

  if (!book) return null;

  const ddcInfo = DDC_CATEGORIES.find((c) => c.code === book.ddc)!;
  const bookLoans = activeRecords.filter((r) => r.bookId === book.id);
  const isAvailable = book.stock > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/35 backdrop-blur-[2px] p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="book-detail-title"
    >
      <div className="w-full max-w-lg rounded-2xl bg-white border border-zinc-200 shadow-lg overflow-hidden">
        <div className={`${ddcInfo.pastelBg} px-6 py-5 border-b ${ddcInfo.pastelBorder} flex items-start justify-between gap-4`}>
          <div>
            <p className="text-xs font-mono text-zinc-600 tabular-nums">
              DDC {book.ddc} · {ddcInfo.title} · {book.callNumber}
            </p>
            <h2
              id="book-detail-title"
              className="text-lg font-semibold text-zinc-900 mt-1.5 leading-snug"
            >
              {book.title}
            </h2>
            <p className="text-xs text-zinc-600 mt-1">
              {book.author} · Terbit {book.year} · {book.pages} halaman
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup detail buku"
            className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-white/60 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="space-y-1.5">
            <h3 className="text-xs font-semibold text-zinc-900">Ringkasan Bacaan</h3>
            <p className="text-sm text-zinc-600 leading-relaxed">{book.synopsis}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 py-3 border-y border-zinc-100 text-xs">
            <div>
              <span className="text-zinc-400 block">Klasifikasi Perpustakaan</span>
              <span className="text-zinc-800 font-medium mt-0.5 block">
                {ddcInfo.formalName}
              </span>
            </div>
            <div>
              <span className="text-zinc-400 block">Ketersediaan Rak</span>
              <span className="text-zinc-800 font-medium mt-0.5 block tabular-nums">
                {book.stock} dari {book.totalStock} eksemplar tersedia
              </span>
            </div>
          </div>

          {bookLoans.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-zinc-900">
                Sedang Dipinjam ({bookLoans.length})
              </h3>
              <ul className="space-y-1.5">
                {bookLoans.map((rec) => (
                  <li
                    key={rec.recordId}
                    className="text-xs text-zinc-600 flex items-center justify-between bg-zinc-50 px-3 py-2 rounded-lg"
                  >
                    <span>
                      <strong className="font-medium text-zinc-900">{rec.borrower}</strong>
                      {' · '}
                      {rec.mode === 'onsite' ? rec.location : 'Dibawa Pulang'}
                    </span>
                    <span className="font-mono text-[11px] text-zinc-400 tabular-nums">
                      {rec.mode === 'onsite' ? rec.borrowedAt : `s.d. ${rec.dueDate}`}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              Tutup
            </button>
            <button
              type="button"
              disabled={!isAvailable}
              onClick={() => {
                onClose();
                onBorrowClick(book.id);
              }}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                isAvailable
                  ? 'bg-zinc-900 text-white hover:bg-zinc-800 cursor-pointer'
                  : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{isAvailable ? 'Pinjam / Baca Buku' : 'Stok Sedang Kosong'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
