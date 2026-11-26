export type DdcCode =
  | '000'
  | '100'
  | '200'
  | '300'
  | '400'
  | '500'
  | '600'
  | '700'
  | '800'
  | '900';

export interface DdcCategory {
  code: DdcCode;
  title: string;
  plainHint: string;
  formalName: string;
  examples: string;
  pastelBg: string;
  pastelBorder: string;
  dotColor: string;
}

export interface Book {
  id: number;
  title: string;
  author: string;
  ddc: DdcCode;
  callNumber: string;
  year: number;
  pages: number;
  stock: number;
  totalStock: number;
  synopsis: string;
}

export type BorrowMode = 'onsite' | 'takehome';

export interface BorrowRecord {
  recordId: string;
  bookId: number;
  title: string;
  author: string;
  ddc: DdcCode;
  callNumber: string;
  mode: BorrowMode;
  borrower: string;
  location: string | null;
  borrowedAt: string;
  borrowedTimestamp: number;
  dueDate: string | null;
}

export interface ReturnedRecord extends BorrowRecord {
  returnedAt: string;
}

export interface ReadingZone {
  id: string;
  name: string;
  atmosphere: string;
  seats: number;
}

export const READING_ZONES: ReadingZone[] = [
  {
    id: 'quiet-a1',
    name: 'Quiet Zone · Meja A1',
    atmosphere: 'Hening total, cocok untuk fokus & riset',
    seats: 12,
  },
  {
    id: 'lounge-s2',
    name: 'Lounge Pastel · Sofa 2',
    atmosphere: 'Santai dengan pencahayaan hangat',
    seats: 8,
  },
  {
    id: 'cowork-c4',
    name: 'Co-Working · Meja C4',
    atmosphere: 'Ramah laptop, colokan di tiap kursi',
    seats: 16,
  },
  {
    id: 'window-d1',
    name: 'Pojok Jendela · Meja D1',
    atmosphere: 'Cahaya alami menghadap taman',
    seats: 6,
  },
];

export const DDC_CATEGORIES: DdcCategory[] = [
  {
    code: '000',
    title: 'Tech & Informasi',
    plainHint: 'Coding, AI, data & literasi digital',
    formalName: 'Karya Umum & Ilmu Komputer',
    examples: 'Pemrograman, jurnalistik, ensiklopedia, UI/UX',
    pastelBg: 'bg-pastel-sky',
    pastelBorder: 'border-[#CFE0F4]',
    dotColor: 'bg-[#6EA3D8]',
  },
  {
    code: '100',
    title: 'Psikologi & Mindset',
    plainHint: 'Self-growth, emosi & cara berpikir',
    formalName: 'Filsafat & Psikologi',
    examples: 'Kebiasaan baik, stoikisme, kesehatan mental, logika',
    pastelBg: 'bg-pastel-lavender',
    pastelBorder: 'border-[#DDD3F2]',
    dotColor: 'bg-[#947FD1]',
  },
  {
    code: '200',
    title: 'Spiritualitas',
    plainHint: 'Agama, makna hidup & etika',
    formalName: 'Agama & Teologi',
    examples: 'Sejarah peradaban iman, refleksi batin, toleransi',
    pastelBg: 'bg-pastel-sage',
    pastelBorder: 'border-[#CDE4D6]',
    dotColor: 'bg-[#63A882]',
  },
  {
    code: '300',
    title: 'Sosial & Finansial',
    plainHint: 'Uang, masyarakat, hukum & isu publik',
    formalName: 'Ilmu Sosial & Ekonomi',
    examples: 'Literasi keuangan, sosiologi, budaya kerja, kebijakan',
    pastelBg: 'bg-pastel-peach',
    pastelBorder: 'border-[#F2D5CA]',
    dotColor: 'bg-[#D9886C]',
  },
  {
    code: '400',
    title: 'Bahasa',
    plainHint: 'Belajar bahasa asing & tata kata',
    formalName: 'Bahasa & Linguistik',
    examples: 'Bahasa Jepang, Inggris, EYD, kamus & komunikasi',
    pastelBg: 'bg-pastel-butter',
    pastelBorder: 'border-[#ECE0BA]',
    dotColor: 'bg-[#C9A642]',
  },
  {
    code: '500',
    title: 'Sains & Semesta',
    plainHint: 'Alam, fisika, biologi & astronomi',
    formalName: 'Ilmu Murni & Sains Alam',
    examples: 'Kosmos, evolusi, matematika populer, ekologi',
    pastelBg: 'bg-pastel-mint',
    pastelBorder: 'border-[#C7E5DF]',
    dotColor: 'bg-[#56A898]',
  },
  {
    code: '600',
    title: 'Karir & Terapan',
    plainHint: 'Bisnis, desain produk, kesehatan & masak',
    formalName: 'Teknologi & Ilmu Terapan',
    examples: 'Manajemen produk, nutrisi, arsitektur, wirausaha',
    pastelBg: 'bg-pastel-rose',
    pastelBorder: 'border-[#EED0DF]',
    dotColor: 'bg-[#C9739C]',
  },
  {
    code: '700',
    title: 'Seni & Pop Culture',
    plainHint: 'Fotografi, musik, film & estetika',
    formalName: 'Kesenian, Hiburan & Olahraga',
    examples: 'Desain grafis, sinema, ilustrasi, hobi kreatif',
    pastelBg: 'bg-pastel-lilac',
    pastelBorder: 'border-[#D7D8F2]',
    dotColor: 'bg-[#7A7ED4]',
  },
  {
    code: '800',
    title: 'Fiksi & Sastra',
    plainHint: 'Novel, cerpen, puisi & esai',
    formalName: 'Kesusastraan',
    examples: 'Fiksi Indonesia, misteri Jepang, antologi puisi',
    pastelBg: 'bg-pastel-coral',
    pastelBorder: 'border-[#F1D8CD]',
    dotColor: 'bg-[#D67D5C]',
  },
  {
    code: '900',
    title: 'Sejarah & Travel',
    plainHint: 'Kisah masa lalu, biografi & geografi',
    formalName: 'Sejarah & Geografi',
    examples: 'Sejarah dunia, catatan perjalanan, biografi tokoh',
    pastelBg: 'bg-pastel-sand',
    pastelBorder: 'border-[#E2DCD2]',
    dotColor: 'bg-[#9E8C73]',
  },
];

export const INITIAL_BOOKS: Book[] = [
  {
    id: 1,
    title: 'Clean Code & Arsitektur Sistem Modern',
    author: 'Robert C. Martin',
    ddc: '000',
    callNumber: '005.1 MAR c',
    year: 2022,
    pages: 431,
    stock: 3,
    totalStock: 3,
    synopsis: 'Panduan praktis menulis kode yang rapi, mudah dirawat, dan scalable untuk developer masa kini.',
  },
  {
    id: 2,
    title: 'Filosofi Teras: Stoikisme untuk Generasi Baru',
    author: 'Henry Manampiring',
    ddc: '100',
    callNumber: '188 MAN f',
    year: 2019,
    pages: 320,
    stock: 3,
    totalStock: 4,
    synopsis: 'Mengelola overthinking dan emosi negatif lewat filsafat Stoa Yunani-Romawi dengan bahasa santai.',
  },
  {
    id: 3,
    title: 'Atomic Habits: Perubahan Kecil Hasil Luar Biasa',
    author: 'James Clear',
    ddc: '100',
    callNumber: '158.1 CLE a',
    year: 2020,
    pages: 356,
    stock: 2,
    totalStock: 2,
    synopsis: 'Kerangka kerja berbasis sains untuk membangun kebiasaan baik dan memutus kebiasaan buruk.',
  },
  {
    id: 4,
    title: 'Sejarah Tuhan & Pencarian Makna',
    author: 'Karen Armstrong',
    ddc: '200',
    callNumber: '200.9 ARM s',
    year: 2018,
    pages: 512,
    stock: 2,
    totalStock: 2,
    synopsis: 'Penelusuran historis bagaimana manusia memaknai spiritualitas dari masa kuno hingga modern.',
  },
  {
    id: 5,
    title: 'The Psychology of Money',
    author: 'Morgan Housel',
    ddc: '300',
    callNumber: '332.024 HOU p',
    year: 2021,
    pages: 252,
    stock: 3,
    totalStock: 3,
    synopsis: '19 kisah pendek tentang cara perilaku, ego, dan perspektif memengaruhi keputusan finansial.',
  },
  {
    id: 6,
    title: 'Bicara Itu Ada Seninya',
    author: 'Oh Su Hyang',
    ddc: '400',
    callNumber: '401.4 OH b',
    year: 2022,
    pages: 238,
    stock: 2,
    totalStock: 2,
    synopsis: 'Teknik komunikasi persuasif, pilihan diksi, dan bahasa tubuh untuk percakapan sehari-hari.',
  },
  {
    id: 7,
    title: 'Cosmos: Mengenal Semesta Lebih Dekat',
    author: 'Carl Sagan',
    ddc: '500',
    callNumber: '520 SAG c',
    year: 2017,
    pages: 396,
    stock: 2,
    totalStock: 2,
    synopsis: 'Perjalanan puitis menelusuri asal-usul bintang, galaksi, dan posisi manusia di alam semesta.',
  },
  {
    id: 8,
    title: 'Design Thinking untuk Produk Digital',
    author: 'Tim Brown',
    ddc: '600',
    callNumber: '658.5 BRO d',
    year: 2021,
    pages: 276,
    stock: 3,
    totalStock: 3,
    synopsis: 'Metodologi pemecahan masalah berbasis empati untuk membangun produk dan layanan inovatif.',
  },
  {
    id: 9,
    title: 'Estetika Minimalis dalam Fotografi',
    author: 'Nadia Kusuma',
    ddc: '700',
    callNumber: '770 KUS e',
    year: 2024,
    pages: 194,
    stock: 2,
    totalStock: 2,
    synopsis: 'Eksplorasi komposisi ruang negatif, cahaya lembut, dan palet warna netral dalam foto modern.',
  },
  {
    id: 10,
    title: 'Laut Bercerita',
    author: 'Leila S. Chudori',
    ddc: '800',
    callNumber: '899.221 CHU l',
    year: 2017,
    pages: 379,
    stock: 3,
    totalStock: 4,
    synopsis: 'Novel sejarah yang menyentuh tentang persahabatan, keberanian, dan kehilangan di akhir 1990-an.',
  },
  {
    id: 11,
    title: 'Keajaiban Toko Kelontong Namiya',
    author: 'Keigo Higashino',
    ddc: '800',
    callNumber: '895.6 HIG k',
    year: 2020,
    pages: 400,
    stock: 3,
    totalStock: 3,
    synopsis: 'Surat-surat anonim lintas waktu yang mempertemukan tiga pemuda dengan kisah hidup penuh hangat.',
  },
  {
    id: 12,
    title: 'Sapiens: Riwayat Singkat Umat Manusia',
    author: 'Yuval Noah Harari',
    ddc: '900',
    callNumber: '909 HAR s',
    year: 2018,
    pages: 525,
    stock: 2,
    totalStock: 2,
    synopsis: 'Bagaimana Homo sapiens berevolusi dari pemburu-pengumpul hingga membentuk peradaban modern.',
  },
];

export function formatIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDaysIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return formatIsoDate(d);
}

export function formatDisplayDate(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  if (!y || !m || !d) return isoDate;
  const dateObj = new Date(y, m - 1, d);
  return dateObj.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function getInitialBorrowedRecords(): BorrowRecord[] {
  const now = Date.now();
  return [
    {
      recordId: 'TRK-1042',
      bookId: 2,
      title: 'Filosofi Teras: Stoikisme untuk Generasi Baru',
      author: 'Henry Manampiring',
      ddc: '100',
      callNumber: '188 MAN f',
      mode: 'onsite',
      borrower: 'Alya Nabila',
      location: 'Quiet Zone · Meja A1',
      borrowedAt: 'Hari ini · 09:15 WIB',
      borrowedTimestamp: now - 1000 * 60 * 95,
      dueDate: null,
    },
    {
      recordId: 'TRK-1043',
      bookId: 10,
      title: 'Laut Bercerita',
      author: 'Leila S. Chudori',
      ddc: '800',
      callNumber: '899.221 CHU l',
      mode: 'takehome',
      borrower: 'Dimas Pratama',
      location: null,
      borrowedAt: addDaysIso(-2),
      borrowedTimestamp: now - 1000 * 60 * 60 * 48,
      dueDate: addDaysIso(5),
    },
  ];
}
