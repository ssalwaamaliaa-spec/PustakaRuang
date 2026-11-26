import React, { useEffect, useState } from 'react';
import { X, MapPin, CalendarClock, BookOpen } from 'lucide-react';
import {
  Book,
  BorrowMode,
  DDC_CATEGORIES,
  READING_ZONES,
  addDaysIso,
  formatDisplayDate,
} from '../data/libraryData';

interface BorrowModalProps {
  isOpen: boolean;
  books: Book[];
  initialBookId: number | null;
  onClose: () => void;
  onConfirm: (payload: {
    bookId: number;
    mode: BorrowMode;
    borrower: string;
    location: string | null;
    days: number;
  }) => void;
}

export const BorrowModal: React.FC<BorrowModalProps> = ({
  isOpen,
  books,
  initialBookId,
  onClose,
  onConfirm,
}) => {
  const availableBooks = books.filter((b) => b.stock > 0);
  const [selectedBookId, setSelectedBookId] = useState<number>(
    initialBookId ?? availableBooks[0]?.id ?? 0
  );
  const [mode, setMode] = useState<BorrowMode>('onsite');
  const [borrower, setBorrower] = useState('');
  const [zone, setZone] = useState(READING_ZONES[0].name);
  const [days, setDays] = useState<number>(7);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const fallbackId = availableBooks[0]?.id ?? 0;
    setSelectedBookId(initialBookId ?? fallbackId);
    setMode('onsite');
    setBorrower('');
    setZone(READING_ZONES[0].name);
    setDays(7);
    setError('');
  }, [isOpen, initialBookId]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const activeBook = books.find((b) => b.id === selectedBookId) || availableBooks[0];
  const ddcInfo = activeBook
    ? DDC_CATEGORIES.find((c) => c.code === activeBook.ddc)
    : undefined;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = borrower.trim();
    if (!trimmed) {
      setError('Mohon masukkan nama peminjam terlebih dahulu.');
      return;
    }
    if (!activeBook || activeBook.stock <= 0) {
      setError('Stok buku ini sedang habis.');
      return;
    }
    onConfirm({
      bookId: activeBook.id,
      mode,
      borrower: trimmed,
      location: mode === 'onsite' ? zone : null,
      days,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/35 backdrop-blur-[2px] p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="borrow-modal-title"
    >
      <div className="w-full max-w-lg rounded-2xl bg-white border border-zinc-200 shadow-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
          <div>
            <h2
              id="borrow-modal-title"
              className="text-base font-semibold text-zinc-900"
            >
              Catat Peminjaman Buku
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Pilih baca di area perpustakaan atau bawa pulang
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal"
            className="p-2 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {availableBooks.length === 0 ? (
            <div className="py-6 text-center space-y-2">
              <p className="text-sm font-medium text-zinc-800">
                Semua koleksi sedang dipinjam saat ini.
              </p>
              <p className="text-xs text-zinc-500">
                Kembalikan buku dari menu Tracking Pinjaman untuk membuka slot.
              </p>
            </div>
          ) : (
            <>
              {/* Book Selector or Preview */}
              {initialBookId && activeBook && ddcInfo ? (
                <div className="flex items-start gap-4 pb-4 border-b border-zinc-100">
                  <div
                    className={`w-12 h-16 rounded-xl ${ddcInfo.pastelBg} border ${ddcInfo.pastelBorder} flex flex-col items-center justify-center shrink-0`}
                  >
                    <span className="font-mono text-xs font-semibold text-zinc-800 tabular-nums">
                      {activeBook.ddc}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-zinc-900 leading-snug">
                      {activeBook.title}
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1">
                      {activeBook.author} · Rak {ddcInfo.code} ({ddcInfo.title})
                    </p>
                    <p className="text-xs font-mono text-zinc-400 mt-1 tabular-nums">
                      No. Panggil: {activeBook.callNumber} · Sisa {activeBook.stock} eksemplar
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label
                    htmlFor="select-book"
                    className="block text-xs font-medium text-zinc-700"
                  >
                    Pilih Judul Buku
                  </label>
                  <select
                    id="select-book"
                    value={selectedBookId}
                    onChange={(e) => setSelectedBookId(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-zinc-200 rounded-xl text-zinc-900 focus:outline-none focus:border-zinc-500"
                  >
                    {availableBooks.map((b) => (
                      <option key={b.id} value={b.id}>
                        [{b.ddc}] {b.title} — {b.author} (Sisa {b.stock})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Borrow Mode Selector */}
              <div className="space-y-2">
                <span className="block text-xs font-medium text-zinc-700">
                  Metode Peminjaman
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setMode('onsite')}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      mode === 'onsite'
                        ? 'border-zinc-900 bg-pastel-sage/75'
                        : 'border-zinc-200 bg-white hover:border-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-zinc-900">
                        Baca di Tempat
                      </span>
                      <MapPin className="w-3.5 h-3.5 text-zinc-600" />
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-1">
                      Tercatat per zona meja baca
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode('takehome')}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      mode === 'takehome'
                        ? 'border-zinc-900 bg-pastel-lavender/80'
                        : 'border-zinc-200 bg-white hover:border-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-zinc-900">
                        Bawa Pulang
                      </span>
                      <CalendarClock className="w-3.5 h-3.5 text-zinc-600" />
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-1">
                      Durasi 3–7 hari dengan pengingat
                    </p>
                  </button>
                </div>
              </div>

              {/* Borrower Name */}
              <div className="space-y-1.5">
                <label
                  htmlFor="borrower-name"
                  className="block text-xs font-medium text-zinc-700"
                >
                  Nama Peminjam / Pengunjung
                </label>
                <input
                  id="borrower-name"
                  type="text"
                  value={borrower}
                  onChange={(e) => {
                    setBorrower(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Contoh: Raka Pratama"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-zinc-200 rounded-xl placeholder:text-zinc-400 focus:outline-none focus:border-zinc-500"
                />
              </div>

              {/* Conditional Fields */}
              {mode === 'onsite' ? (
                <div className="space-y-1.5">
                  <label
                    htmlFor="reading-zone"
                    className="block text-xs font-medium text-zinc-700"
                  >
                    Pilih Zona / Meja Baca
                  </label>
                  <select
                    id="reading-zone"
                    value={zone}
                    onChange={(e) => setZone(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-zinc-200 rounded-xl focus:outline-none focus:border-zinc-500"
                  >
                    {READING_ZONES.map((z) => (
                      <option key={z.id} value={z.name}>
                        {z.name} — {z.atmosphere}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label
                    htmlFor="borrow-days"
                    className="block text-xs font-medium text-zinc-700"
                  >
                    Durasi Pinjam
                  </label>
                  <select
                    id="borrow-days"
                    value={days}
                    onChange={(e) => setDays(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-zinc-200 rounded-xl focus:outline-none focus:border-zinc-500"
                  >
                    <option value={3}>3 Hari (Kembali {formatDisplayDate(addDaysIso(3))})</option>
                    <option value={5}>5 Hari (Kembali {formatDisplayDate(addDaysIso(5))})</option>
                    <option value={7}>7 Hari · Standar (Kembali {formatDisplayDate(addDaysIso(7))})</option>
                  </select>
                </div>
              )}

              {error && (
                <p className="text-xs font-medium text-rose-600" role="alert">
                  {error}
                </p>
              )}

              <div className="pt-1 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-xs font-medium text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 text-white text-xs font-medium hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Konfirmasi & Catat Tracking</span>
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};
