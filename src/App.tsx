import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Search,
  BookOpen,
  MapPin,
  CalendarClock,
  CheckCircle2,
  RotateCcw,
  ArrowUpRight,
} from 'lucide-react';
import {
  Book,
  BorrowMode,
  BorrowRecord,
  DDC_CATEGORIES,
  DdcCode,
  INITIAL_BOOKS,
  READING_ZONES,
  ReturnedRecord,
  addDaysIso,
  formatDisplayDate,
  formatIsoDate,
  getInitialBorrowedRecords,
} from './data/libraryData';
import { BorrowModal } from './components/BorrowModal';
import { DdcGuideModal } from './components/DdcGuideModal';
import { BookDetailModal } from './components/BookDetailModal';

type ActiveView = 'catalog' | 'tracking';
type TrackFilter = 'all' | 'onsite' | 'takehome';

const STORAGE_KEYS = {
  books: 'pustakaruang_books_v1',
  borrowed: 'pustakaruang_borrowed_v1',
  returned: 'pustakaruang_returned_v1',
};

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [books, setBooks] = useState<Book[]>(() =>
    loadFromStorage<Book[]>(STORAGE_KEYS.books, INITIAL_BOOKS)
  );
  const [borrowedRecords, setBorrowedRecords] = useState<BorrowRecord[]>(() =>
    loadFromStorage<BorrowRecord[]>(
      STORAGE_KEYS.borrowed,
      getInitialBorrowedRecords()
    )
  );
  const [returnedRecords, setReturnedRecords] = useState<ReturnedRecord[]>(() =>
    loadFromStorage<ReturnedRecord[]>(STORAGE_KEYS.returned, [])
  );

  const [activeView, setActiveView] = useState<ActiveView>('catalog');
  const [selectedDdc, setSelectedDdc] = useState<DdcCode | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [trackFilter, setTrackFilter] = useState<TrackFilter>('all');
  const [trackSearch, setTrackSearch] = useState('');

  const [borrowModalBookId, setBorrowModalBookId] = useState<number | null>(null);
  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [detailBookId, setDetailBookId] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const ddcSectionRef = useRef<HTMLElement | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.books, JSON.stringify(books));
    } catch {
      // Ignore storage quota issues
    }
  }, [books]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.borrowed,
        JSON.stringify(borrowedRecords)
      );
    } catch {
      // Ignore storage quota issues
    }
  }, [borrowedRecords]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.returned,
        JSON.stringify(returnedRecords)
      );
    } catch {
      // Ignore storage quota issues
    }
  }, [returnedRecords]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 3400);
  };

  const getDdcInfo = (code: DdcCode) =>
    DDC_CATEGORIES.find((c) => c.code === code) || DDC_CATEGORIES[0];

  const filteredBooks = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return books.filter((book) => {
      const matchDdc = selectedDdc === 'all' || book.ddc === selectedDdc;
      if (!matchDdc) return false;
      if (!q) return true;
      const ddcInfo = getDdcInfo(book.ddc);
      return (
        book.title.toLowerCase().includes(q) ||
        book.author.toLowerCase().includes(q) ||
        book.callNumber.toLowerCase().includes(q) ||
        book.ddc.includes(q) ||
        ddcInfo.title.toLowerCase().includes(q) ||
        ddcInfo.plainHint.toLowerCase().includes(q)
      );
    });
  }, [books, selectedDdc, searchQuery]);

  const onsiteCount = useMemo(
    () => borrowedRecords.filter((r) => r.mode === 'onsite').length,
    [borrowedRecords]
  );
  const takehomeCount = useMemo(
    () => borrowedRecords.filter((r) => r.mode === 'takehome').length,
    [borrowedRecords]
  );

  const filteredTracking = useMemo(() => {
    const q = trackSearch.toLowerCase().trim();
    return borrowedRecords.filter((rec) => {
      const matchMode = trackFilter === 'all' || rec.mode === trackFilter;
      if (!matchMode) return false;
      if (!q) return true;
      return (
        rec.title.toLowerCase().includes(q) ||
        rec.borrower.toLowerCase().includes(q) ||
        rec.recordId.toLowerCase().includes(q) ||
        (rec.location && rec.location.toLowerCase().includes(q))
      );
    });
  }, [borrowedRecords, trackFilter, trackSearch]);

  const detailBook = useMemo(
    () => books.find((b) => b.id === detailBookId) || null,
    [books, detailBookId]
  );

  const handleOpenBorrowModal = (bookId: number | null) => {
    setBorrowModalBookId(bookId);
    setIsBorrowModalOpen(true);
  };

  const handleConfirmBorrow = ({
    bookId,
    mode,
    borrower,
    location,
    days,
  }: {
    bookId: number;
    mode: BorrowMode;
    borrower: string;
    location: string | null;
    days: number;
  }) => {
    const target = books.find((b) => b.id === bookId);
    if (!target || target.stock <= 0) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const newRecord: BorrowRecord = {
      recordId: `TRK-${Math.floor(1000 + Math.random() * 9000)}`,
      bookId: target.id,
      title: target.title,
      author: target.author,
      ddc: target.ddc,
      callNumber: target.callNumber,
      mode,
      borrower,
      location: mode === 'onsite' ? location : null,
      borrowedAt:
        mode === 'onsite'
          ? `Hari ini · ${timeStr} WIB`
          : formatIsoDate(now),
      borrowedTimestamp: now.getTime(),
      dueDate: mode === 'takehome' ? addDaysIso(days) : null,
    };

    setBooks((prev) =>
      prev.map((b) =>
        b.id === bookId ? { ...b, stock: Math.max(0, b.stock - 1) } : b
      )
    );
    setBorrowedRecords((prev) => [newRecord, ...prev]);
    setIsBorrowModalOpen(false);
    setBorrowModalBookId(null);

    showToast(
      mode === 'onsite'
        ? `Tercatat untuk ${borrower} di ${location}.`
        : `Berhasil dipinjam ${borrower}. Batas kembali ${formatDisplayDate(
            newRecord.dueDate!
          )}.`
    );
  };

  const handleReturnBook = (recordId: string) => {
    const target = borrowedRecords.find((r) => r.recordId === recordId);
    if (!target) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });

    setBooks((prev) =>
      prev.map((b) =>
        b.id === target.bookId
          ? { ...b, stock: Math.min(b.totalStock, b.stock + 1) }
          : b
      )
    );
    setBorrowedRecords((prev) => prev.filter((r) => r.recordId !== recordId));
    setReturnedRecords((prev) => [
      { ...target, returnedAt: `Hari ini · ${timeStr} WIB` },
      ...prev.slice(0, 7),
    ]);

    showToast(`"${target.title}" telah dikembalikan ke rak ${target.ddc}.`);
  };

  const handleJumpToDdc = () => {
    setActiveView('catalog');
    window.setTimeout(() => {
      ddcSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 40);
  };

  const handleResetDemo = () => {
    setBooks(INITIAL_BOOKS);
    setBorrowedRecords(getInitialBorrowedRecords());
    setReturnedRecords([]);
    setSelectedDdc('all');
    setSearchQuery('');
    setTrackFilter('all');
    setTrackSearch('');
    showToast('Data katalog dan tracking dikembalikan ke kondisi awal.');
  };

  const getDueStatusText = (dueDateIso: string) => {
    const todayIso = formatIsoDate(new Date());
    const [ty, tm, td] = todayIso.split('-').map(Number);
    const [dy, dm, dd] = dueDateIso.split('-').map(Number);
    const todayMs = new Date(ty, tm - 1, td).getTime();
    const dueMs = new Date(dy, dm - 1, dd).getTime();
    const diffDays = Math.round((dueMs - todayMs) / (1000 * 60 * 60 * 24));

    if (diffDays > 1) {
      return {
        label: `Sisa ${diffDays} hari · Kembali ${formatDisplayDate(dueDateIso)}`,
        isUrgent: false,
      };
    }
    if (diffDays === 1) {
      return {
        label: `Besok jatuh tempo (${formatDisplayDate(dueDateIso)})`,
        isUrgent: true,
      };
    }
    if (diffDays === 0) {
      return {
        label: `Jatuh tempo hari ini (${formatDisplayDate(dueDateIso)})`,
        isUrgent: true,
      };
    }
    return {
      label: `Terlambat ${Math.abs(diffDays)} hari (${formatDisplayDate(dueDateIso)})`,
      isUrgent: true,
    };
  };

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink">
      {/* Top Bar Contract: 1-row, 3 zones separated by gap-8 */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-zinc-200/80">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single text element wordmark */}
          <button
            type="button"
            onClick={() => setActiveView('catalog')}
            className="text-lg font-bold tracking-tight text-zinc-900 whitespace-nowrap shrink-0 cursor-pointer"
          >
            PustakaRuang
          </button>

          {/* Zone 2: Clean single-line text navigation links */}
          <nav
            aria-label="Navigasi utama"
            className="flex items-center gap-5 sm:gap-7 text-xs sm:text-sm font-medium text-zinc-500 overflow-x-auto"
          >
            <button
              type="button"
              onClick={() => setActiveView('catalog')}
              className={`py-1 whitespace-nowrap shrink-0 transition-colors cursor-pointer border-b-2 ${
                activeView === 'catalog'
                  ? 'text-zinc-900 border-zinc-900'
                  : 'border-transparent hover:text-zinc-900'
              }`}
            >
              Katalog
            </button>
            <button
              type="button"
              onClick={handleJumpToDdc}
              className="hidden sm:inline-block py-1 whitespace-nowrap shrink-0 border-b-2 border-transparent hover:text-zinc-900 transition-colors cursor-pointer"
            >
              Rak DDC
            </button>
            <button
              type="button"
              onClick={() => setActiveView('tracking')}
              className={`py-1 whitespace-nowrap shrink-0 transition-colors cursor-pointer border-b-2 tabular-nums ${
                activeView === 'tracking'
                  ? 'text-zinc-900 border-zinc-900'
                  : 'border-transparent hover:text-zinc-900'
              }`}
            >
              Tracking ({borrowedRecords.length})
            </button>
            <button
              type="button"
              onClick={() => setIsGuideOpen(true)}
              className="hidden md:inline-block py-1 whitespace-nowrap shrink-0 border-b-2 border-transparent hover:text-zinc-900 transition-colors cursor-pointer"
            >
              Panduan DDC
            </button>
          </nav>

          {/* Zone 3: Single primary action */}
          <div className="shrink-0">
            <button
              type="button"
              onClick={() => handleOpenBorrowModal(null)}
              className="px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-medium hover:bg-zinc-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Pinjam Buku
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {activeView === 'catalog' ? (
          <div className="space-y-10">
            {/* Hero & Search */}
            <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-zinc-200/70">
              <div className="space-y-2.5 max-w-2xl">
                <p className="text-xs font-medium text-zinc-500">
                  Perpustakaan Digital Minimalis · Klasifikasi DDC Ramah Pembaca
                </p>
                <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-zinc-900 leading-[1.2] text-balance">
                  Temukan bacaanmu cepat, pilih baca di tempat atau bawa pulang.
                </h1>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500 pt-1">
                  <span className="tabular-nums">{books.length} judul terkurasi</span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">{READING_ZONES.length} zona baca tersedia</span>
                  <span aria-hidden="true">·</span>
                  <button
                    type="button"
                    onClick={() => setActiveView('tracking')}
                    className="text-zinc-800 font-medium underline underline-offset-4 hover:text-zinc-950 cursor-pointer tabular-nums"
                  >
                    {borrowedRecords.length} buku sedang dipinjam
                  </button>
                </div>
              </div>

              {/* Search Input */}
              <div className="w-full lg:w-88 shrink-0">
                <label htmlFor="catalog-search" className="sr-only">
                  Cari judul, penulis, topik, atau kode DDC
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="catalog-search"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari judul, penulis, atau topik (mis. stoik)..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-500 transition-colors"
                  />
                </div>
              </div>
            </section>

            {/* DDC Shelf Classification Upfront (Friendly for Non-Librarians) */}
            <section ref={ddcSectionRef} className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                <div>
                  <h2 className="text-lg font-semibold text-zinc-900">
                    Rak Klasifikasi DDC (000–900)
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
                    Pilih topik di bawah tanpa perlu hafal kode perpustakaan—warna pastel menandai tiap rak.
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setIsGuideOpen(true)}
                    className="text-xs font-medium text-zinc-600 hover:text-zinc-900 underline underline-offset-4 whitespace-nowrap cursor-pointer"
                  >
                    Apa itu kode DDC?
                  </button>
                  {selectedDdc !== 'all' && (
                    <button
                      type="button"
                      onClick={() => setSelectedDdc('all')}
                      className="text-xs font-medium text-zinc-900 underline underline-offset-4 whitespace-nowrap cursor-pointer"
                    >
                      Tampilkan Semua Rak
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {DDC_CATEGORIES.map((cat) => {
                  const isActive = selectedDdc === cat.code;
                  const countInShelf = books.filter((b) => b.ddc === cat.code).length;
                  return (
                    <button
                      key={cat.code}
                      type="button"
                      onClick={() =>
                        setSelectedDdc((prev) =>
                          prev === cat.code ? 'all' : cat.code
                        )
                      }
                      aria-pressed={isActive}
                      className={`text-left p-3.5 rounded-xl border transition-all duration-150 cursor-pointer flex flex-col justify-between gap-2.5 ${
                        isActive
                          ? `${cat.pastelBg} border-zinc-900`
                          : 'bg-white border-zinc-200/90 hover:border-zinc-400'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md font-mono text-xs font-semibold tabular-nums border ${
                            isActive
                              ? 'bg-white/90 border-zinc-300 text-zinc-900'
                              : `${cat.pastelBg} ${cat.pastelBorder} text-zinc-800`
                          }`}
                        >
                          {cat.code}
                        </span>
                        <span className="text-[11px] text-zinc-400 tabular-nums">
                          {countInShelf} judul
                        </span>
                      </div>

                      <div>
                        <h3 className="text-xs sm:text-sm font-semibold text-zinc-900 leading-snug">
                          {cat.title}
                        </h3>
                        <p className="text-[11px] text-zinc-500 mt-0.5 line-clamp-1">
                          {cat.plainHint}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Book Catalog Grid */}
            <section className="space-y-5">
              <div className="flex items-center justify-between border-b border-zinc-200/80 pb-3">
                <div className="flex items-baseline gap-2.5">
                  <h2 className="text-lg font-semibold text-zinc-900">
                    {selectedDdc === 'all'
                      ? 'Semua Koleksi'
                      : `Rak ${selectedDdc} · ${getDdcInfo(selectedDdc).title}`}
                  </h2>
                  <span className="text-xs text-zinc-500 tabular-nums">
                    {filteredBooks.length} buku
                  </span>
                </div>
                <span className="hidden sm:inline text-xs text-zinc-400">
                  Klik judul untuk sinopsis atau langsung pinjam
                </span>
              </div>

              {filteredBooks.length === 0 ? (
                <div className="py-16 text-center bg-white border border-zinc-200/80 rounded-2xl space-y-3">
                  <p className="text-sm font-medium text-zinc-800">
                    Tidak ada buku yang cocok dengan pencarianmu.
                  </p>
                  <p className="text-xs text-zinc-500">
                    Coba ubah kata kunci atau lihat seluruh rak DDC.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedDdc('all');
                    }}
                    className="px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-medium hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    Reset Pencarian
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {filteredBooks.map((book) => {
                    const ddc = getDdcInfo(book.ddc);
                    const isAvailable = book.stock > 0;
                    return (
                      <article
                        key={book.id}
                        className="bg-white border border-zinc-200/85 rounded-2xl p-4 flex flex-col justify-between transition-colors hover:border-zinc-300"
                      >
                        <div>
                          {/* Minimalist Pastel Book Cover Block */}
                          <button
                            type="button"
                            onClick={() => setDetailBookId(book.id)}
                            className={`w-full text-left ${ddc.pastelBg} border ${ddc.pastelBorder} rounded-xl p-4 mb-4 h-32 flex flex-col justify-between transition-transform duration-150 hover:-translate-y-0.5 cursor-pointer`}
                          >
                            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-700 tabular-nums">
                              <span className="font-semibold">DDC {book.ddc}</span>
                              <span>{book.year}</span>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-zinc-700 truncate">
                                {ddc.title}
                              </p>
                              <p className="text-[11px] font-mono text-zinc-500 mt-0.5 truncate">
                                {book.callNumber}
                              </p>
                            </div>
                          </button>

                          {/* Unboxed Metadata & Book Title */}
                          <button
                            type="button"
                            onClick={() => setDetailBookId(book.id)}
                            className="text-left group cursor-pointer w-full"
                          >
                            <h3 className="text-sm font-semibold text-zinc-900 leading-snug line-clamp-2 group-hover:underline underline-offset-2">
                              {book.title}
                            </h3>
                          </button>
                          <p className="text-xs text-zinc-500 mt-1.5">
                            {book.author} · {book.pages} hlm
                          </p>
                        </div>

                        <div className="mt-5 pt-3 border-t border-zinc-100 flex items-center justify-between gap-2">
                          <span
                            className={`text-xs font-medium tabular-nums ${
                              isAvailable ? 'text-emerald-700' : 'text-rose-600'
                            }`}
                          >
                            {isAvailable
                              ? `Tersedia (${book.stock}/${book.totalStock})`
                              : 'Sedang Kosong'}
                          </span>

                          <button
                            type="button"
                            disabled={!isAvailable}
                            onClick={() => handleOpenBorrowModal(book.id)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                              isAvailable
                                ? 'bg-zinc-900 text-white hover:bg-zinc-800 cursor-pointer'
                                : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                            }`}
                          >
                            {isAvailable ? 'Pinjam / Baca' : 'Habis'}
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        ) : (
          /* ==================== TRACKING PINJAMAN VIEW ==================== */
          <div className="space-y-8">
            <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-zinc-200/70">
              <div className="space-y-2 max-w-2xl">
                <p className="text-xs font-medium text-zinc-500">
                  Sirkulasi Real-Time · Area Baca & Bawa Pulang
                </p>
                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900 text-balance">
                  Tracking Peminjaman Buku
                </h1>
                <p className="text-sm text-zinc-500">
                  Pantau posisi meja pembaca di tempat maupun batas tanggal pengembalian buku yang dibawa pulang.
                </p>
              </div>

              {/* Clean Tabular Summary Strip (No nested card sandwiches) */}
              <div className="flex items-center divide-x divide-zinc-200 bg-white border border-zinc-200/90 rounded-xl px-2 py-2.5 shrink-0">
                <div className="px-4">
                  <p className="text-[11px] text-zinc-500">Baca di Tempat</p>
                  <p className="text-lg font-semibold text-zinc-900 tabular-nums mt-0.5">
                    {onsiteCount}
                  </p>
                </div>
                <div className="px-4">
                  <p className="text-[11px] text-zinc-500">Bawa Pulang</p>
                  <p className="text-lg font-semibold text-zinc-900 tabular-nums mt-0.5">
                    {takehomeCount}
                  </p>
                </div>
                <div className="px-4">
                  <p className="text-[11px] text-zinc-500">Total Aktif</p>
                  <p className="text-lg font-semibold text-zinc-900 tabular-nums mt-0.5">
                    {borrowedRecords.length}
                  </p>
                </div>
              </div>
            </section>

            {/* Filter & Search Toolbar */}
            <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="inline-flex items-center gap-1 p-1 bg-zinc-100 rounded-xl self-start">
                <button
                  type="button"
                  onClick={() => setTrackFilter('all')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    trackFilter === 'all'
                      ? 'bg-white text-zinc-900 shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  Semua Aktivitas
                </button>
                <button
                  type="button"
                  onClick={() => setTrackFilter('onsite')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    trackFilter === 'onsite'
                      ? 'bg-white text-zinc-900 shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  Baca di Tempat
                </button>
                <button
                  type="button"
                  onClick={() => setTrackFilter('takehome')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    trackFilter === 'takehome'
                      ? 'bg-white text-zinc-900 shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  Dibawa Pulang
                </button>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-68">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={trackSearch}
                    onChange={(e) => setTrackSearch(e.target.value)}
                    placeholder="Cari nama peminjam, judul, atau meja..."
                    className="w-full pl-9 pr-3.5 py-2 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleResetDemo}
                  title="Reset data contoh"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-200 bg-white text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:border-zinc-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Reset Demo</span>
                </button>
              </div>
            </section>

            {/* Active Loans List */}
            {filteredTracking.length === 0 ? (
              <div className="py-16 text-center bg-white border border-zinc-200/80 rounded-2xl space-y-3">
                <p className="text-sm font-medium text-zinc-800">
                  Belum ada catatan peminjaman pada filter ini.
                </p>
                <p className="text-xs text-zinc-500">
                  Pilih buku dari katalog untuk mulai membaca di tempat atau meminjam bawa pulang.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveView('catalog')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-medium hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <span>Jelajahi Katalog</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTracking.map((rec) => {
                  const ddc = getDdcInfo(rec.ddc);
                  const isOnsite = rec.mode === 'onsite';
                  const dueStatus =
                    !isOnsite && rec.dueDate
                      ? getDueStatusText(rec.dueDate)
                      : null;

                  return (
                    <article
                      key={rec.recordId}
                      className="bg-white border border-zinc-200/90 rounded-2xl p-5 flex flex-col justify-between gap-4"
                    >
                      <div className="space-y-3.5">
                        {/* Mode Header Strip (Pastel accent tint, clean text + icon, zero pills) */}
                        <div className="flex items-center justify-between gap-3 pb-3 border-b border-zinc-100">
                          <div
                            className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                              isOnsite
                                ? 'bg-pastel-sage text-emerald-900'
                                : 'bg-pastel-lavender text-violet-950'
                            }`}
                          >
                            {isOnsite ? (
                              <MapPin className="w-3.5 h-3.5" />
                            ) : (
                              <CalendarClock className="w-3.5 h-3.5" />
                            )}
                            <span>
                              {isOnsite ? 'Baca di Tempat' : 'Dibawa Pulang'}
                            </span>
                          </div>
                          <span className="font-mono text-xs text-zinc-400 tabular-nums">
                            {rec.recordId}
                          </span>
                        </div>

                        {/* Book Title & Unboxed DDC Metadata */}
                        <div>
                          <p className="text-xs text-zinc-500">
                            <span className="font-mono font-medium text-zinc-700">
                              DDC {rec.ddc}
                            </span>
                            {' · '}
                            <span>{ddc.title}</span>
                            {' · '}
                            <span>Peminjam: </span>
                            <strong className="font-semibold text-zinc-900">
                              {rec.borrower}
                            </strong>
                          </p>
                          <h3 className="text-base font-semibold text-zinc-900 mt-1 leading-snug">
                            {rec.title}
                          </h3>
                          <p className="text-xs text-zinc-500 mt-0.5">
                            {rec.author} · {rec.callNumber}
                          </p>
                        </div>

                        {/* Tracking Details (Clean hairline definition rows, no card-in-card) */}
                        <dl className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-100 text-xs">
                          {isOnsite ? (
                            <>
                              <div>
                                <dt className="text-zinc-400">Zona / Meja Baca</dt>
                                <dd className="font-medium text-zinc-900 mt-0.5">
                                  {rec.location}
                                </dd>
                              </div>
                              <div>
                                <dt className="text-zinc-400">Mulai Baca</dt>
                                <dd className="font-mono text-zinc-700 mt-0.5 tabular-nums">
                                  {rec.borrowedAt}
                                </dd>
                              </div>
                            </>
                          ) : (
                            <>
                              <div>
                                <dt className="text-zinc-400">Tanggal Pinjam</dt>
                                <dd className="font-medium text-zinc-800 mt-0.5 tabular-nums">
                                  {formatDisplayDate(rec.borrowedAt)}
                                </dd>
                              </div>
                              <div>
                                <dt className="text-zinc-400">Status Tempo</dt>
                                <dd
                                  className={`font-medium mt-0.5 tabular-nums ${
                                    dueStatus?.isUrgent
                                      ? 'text-amber-700'
                                      : 'text-zinc-900'
                                  }`}
                                >
                                  {dueStatus?.label}
                                </dd>
                              </div>
                            </>
                          )}
                        </dl>
                      </div>

                      <div className="flex items-center justify-end pt-2 border-t border-zinc-100">
                        <button
                          type="button"
                          onClick={() => handleReturnBook(rec.recordId)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-zinc-200 text-xs font-medium text-zinc-800 hover:bg-zinc-900 hover:text-white hover:border-zinc-900 transition-colors cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>
                            {isOnsite
                              ? 'Selesai Baca & Taruh Rak'
                              : 'Kembalikan Buku'}
                          </span>
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {/* Recently Returned Log */}
            {returnedRecords.length > 0 && (
              <section className="pt-4 space-y-3">
                <h2 className="text-sm font-semibold text-zinc-900">
                  Riwayat Pengembalian Terbaru
                </h2>
                <div className="bg-white border border-zinc-200/80 rounded-2xl divide-y divide-zinc-100 overflow-hidden">
                  {returnedRecords.map((item) => (
                    <div
                      key={`${item.recordId}-${item.returnedAt}`}
                      className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="font-mono text-zinc-400 tabular-nums shrink-0">
                          {item.ddc}
                        </span>
                        <span className="font-medium text-zinc-900 truncate">
                          {item.title}
                        </span>
                        <span className="text-zinc-400 shrink-0">
                          · {item.borrower}
                        </span>
                      </div>
                      <span className="text-zinc-500 font-mono text-[11px] tabular-nums shrink-0">
                        {item.mode === 'onsite' ? 'Baca di tempat' : 'Bawa pulang'} · Kembali {item.returnedAt}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      {/* Quiet Editorial Footer */}
      <footer className="border-t border-zinc-200/70 bg-white mt-12">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500">
          <span>PustakaRuang · Perpustakaan Digital Minimalis</span>
          <div className="flex items-center gap-4">
            <span>Klasifikasi Standar DDC 000–900</span>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => setIsGuideOpen(true)}
              className="hover:text-zinc-900 underline underline-offset-4 cursor-pointer"
            >
              Panduan Rak DDC
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <BorrowModal
        isOpen={isBorrowModalOpen}
        books={books}
        initialBookId={borrowModalBookId}
        onClose={() => {
          setIsBorrowModalOpen(false);
          setBorrowModalBookId(null);
        }}
        onConfirm={handleConfirmBorrow}
      />

      <DdcGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onSelectDdc={(code) => {
          setActiveView('catalog');
          setSelectedDdc(code);
        }}
      />

      <BookDetailModal
        book={detailBook}
        activeRecords={borrowedRecords}
        onClose={() => setDetailBookId(null)}
        onBorrowClick={(bookId) => handleOpenBorrowModal(bookId)}
      />

      {/* Non-intrusive Toast */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 bg-zinc-900 text-white text-xs font-medium px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 max-w-[90vw]"
        >
          <BookOpen className="w-3.5 h-3.5 shrink-0 text-zinc-300" />
          <span className="truncate">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
