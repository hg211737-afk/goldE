import { LanguageInfo, FusionParadigmInfo } from '../types';

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  {
    id: 'python',
    name: 'Python',
    nameAr: 'بايثون',
    color: '#38bdf8',
    badgeBg: 'rgba(56, 189, 248, 0.15)',
    icon: 'FileCode2',
    extension: '.py',
    category: 'Data'
  },
  {
    id: 'javascript',
    name: 'JavaScript / Node.js',
    nameAr: 'جافاسكريبت / نود',
    color: '#facc15',
    badgeBg: 'rgba(250, 204, 21, 0.15)',
    icon: 'FileJson',
    extension: '.js',
    category: 'Web'
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    nameAr: 'تايب سكريبت',
    color: '#60a5fa',
    badgeBg: 'rgba(96, 165, 250, 0.15)',
    icon: 'FileCode',
    extension: '.ts',
    category: 'Web'
  },
  {
    id: 'bash',
    name: 'Bash / Shell',
    nameAr: 'باش / شل',
    color: '#4ade80',
    badgeBg: 'rgba(74, 222, 128, 0.15)',
    icon: 'Terminal',
    extension: '.sh',
    category: 'Shell'
  },
  {
    id: 'rust',
    name: 'Rust',
    nameAr: 'رست (أداء فائق)',
    color: '#fb923c',
    badgeBg: 'rgba(251, 146, 60, 0.15)',
    icon: 'Cpu',
    extension: '.rs',
    category: 'System'
  },
  {
    id: 'go',
    name: 'Go (Golang)',
    nameAr: 'جو (تزامن هائل)',
    color: '#22d3ee',
    badgeBg: 'rgba(34, 211, 238, 0.15)',
    icon: 'Zap',
    extension: '.go',
    category: 'System'
  },
  {
    id: 'cpp',
    name: 'C++',
    nameAr: 'سي بلس بلس',
    color: '#818cf8',
    badgeBg: 'rgba(129, 140, 248, 0.15)',
    icon: 'Layers',
    extension: '.cpp',
    category: 'System'
  },
  {
    id: 'c',
    name: 'C',
    nameAr: 'لغة سي الأصلية',
    color: '#94a3b8',
    badgeBg: 'rgba(148, 163, 184, 0.15)',
    icon: 'Binary',
    extension: '.c',
    category: 'System'
  },
  {
    id: 'php',
    name: 'PHP',
    nameAr: 'بي إتش بي',
    color: '#a78bfa',
    badgeBg: 'rgba(167, 139, 250, 0.15)',
    icon: 'Server',
    extension: '.php',
    category: 'Web'
  },
  {
    id: 'ruby',
    name: 'Ruby',
    nameAr: 'روبي',
    color: '#f43f5e',
    badgeBg: 'rgba(244, 63, 94, 0.15)',
    icon: 'Gem',
    extension: '.rb',
    category: 'Scripting'
  },
  {
    id: 'powershell',
    name: 'PowerShell',
    nameAr: 'باور شيل',
    color: '#3b82f6',
    badgeBg: 'rgba(59, 130, 246, 0.15)',
    icon: 'Command',
    extension: '.ps1',
    category: 'Shell'
  },
  {
    id: 'sql',
    name: 'SQL',
    nameAr: 'إس كيو إل',
    color: '#f97316',
    badgeBg: 'rgba(249, 115, 22, 0.15)',
    icon: 'Database',
    extension: '.sql',
    category: 'Data'
  },
  {
    id: 'lua',
    name: 'Lua',
    nameAr: 'لوا',
    color: '#0284c7',
    badgeBg: 'rgba(2, 132, 199, 0.15)',
    icon: 'PlayCircle',
    extension: '.lua',
    category: 'Scripting'
  }
];

export const FUSION_PARADIGMS: FusionParadigmInfo[] = [
  {
    id: 'subprocess_pipes',
    name: 'Subprocess & Pipes Glue',
    nameAr: 'أنابيب التدفق اللحظي (Unix Pipes & Subprocess)',
    descriptionAr: 'تمرير البيانات بين العمليات المختلفة عبر أنابيب stdin/stdout بصيغة JSON تدفقية سريعة جداً بدون ملفات وسيطة.',
    descriptionEn: 'Streaming real-time data between language processes via OS standard I/O pipes.',
    speedRating: 4,
    complexityRating: 2,
    iconName: 'GitMerge',
    bestUseCases: ['معالجة تدفقات البيانات الحية', 'ربط سكربتات بايثون بنود أو باش', 'البوتات وأنظمة المراقبة']
  },
  {
    id: 'ffi_bindings',
    name: 'FFI & Native C-ABI Bindings',
    nameAr: 'ربط الذاكرة والواجهات الأصلية (FFI / C-Types / PyO3)',
    descriptionAr: 'استدعاء دوال برمجية مكتوبة بـ C أو Rust أو C++ مباشرة داخل بايثون أو جافاسكريبت بدون أي وسيط وسرعة فائقة في الذاكرة RAM.',
    descriptionEn: 'Direct in-memory zero-copy function calls between native compiled code and interpreted languages.',
    speedRating: 5,
    complexityRating: 4,
    iconName: 'Cpu',
    bestUseCases: ['الخوارزميات الحسابية فائقة السرعة', 'التشفير ومعالجة الصور والفيديو', 'تداول الصفقات عالي التردد HFT']
  },
  {
    id: 'polyglot_single_file',
    name: 'True Polyglot Single-File Quine',
    nameAr: 'سكربت هجين بملف واحد (Single-File Polyglot)',
    descriptionAr: 'ملف كودي فريد مكتوب بطريقة هندسية عبقرية بحيث يمكن تشغيله مباشرة في لغتين مختلفتين كـ Bash وبايثون في نفس الوقت!',
    descriptionEn: 'A single script crafted to be valid executable code across multiple languages simultaneously.',
    speedRating: 5,
    complexityRating: 5,
    iconName: 'Sparkles',
    bestUseCases: ['سكربتات الأتمتة التي تعمل على أي نظام', 'توزيع الأدوات بدون تبعات تثبيت', 'الحلول الاستثنائية الذكية']
  },
  {
    id: 'microservice_ipc',
    name: 'Microservice IPC & JSON-RPC',
    nameAr: 'تواصل الخدمات والـ IPC (Unix Domain Sockets / RPC)',
    descriptionAr: 'توزيع المهام بين خديمين مستقلين بلغتين مختلفتين يتواصلان عبر مقابس شبكية محلية فائقة الكفاءة أو JSON-RPC.',
    descriptionEn: 'Decoupled language services communicating via high-speed Unix sockets or lightweight RPC protocol.',
    speedRating: 4,
    complexityRating: 3,
    iconName: 'Network',
    bestUseCases: ['الأنظمة الموزعة', 'الخدمات التي تتطلب استقلالية في التوسيع', 'ربط واجهات الويب بمعالجات خلفية']
  },
  {
    id: 'wasm_bridge',
    name: 'WebAssembly Bridge (Wasm + JS)',
    nameAr: 'جسر الويب أسمبلي (Wasm + JavaScript)',
    descriptionAr: 'تجميع كود مكتوب بلغات النظام مثل Rust أو C إلى صيغة WebAssembly وتشغيلها داخل بيئة الويب أو Node.js.',
    descriptionEn: 'Compiling high-performance systems languages into Wasm modules executable in JavaScript runtimes.',
    speedRating: 5,
    complexityRating: 4,
    iconName: 'Globe',
    bestUseCases: ['التشغيل المباشر داخل المتصفح بأقصى سرعة', 'الذكاء الاصطناعي على أجهزة المستخدمين', 'معالجة البيانات الضخمة']
  },
  {
    id: 'pipeline_orchestration',
    name: 'Multi-stage Pipeline (Task / Make / Shell)',
    nameAr: 'خط أنابيب تسلسلي (Multi-stage Pipeline)',
    descriptionAr: 'سلسلة خطوات مترابطة تنفذ مراحل العمل؛ كل مرحلة بلغة متخصصة (استخراج بـ Bash، تحليل بـ Python، عرض بـ Node.js).',
    descriptionEn: 'Sequential multi-language workflow chaining discrete tasks and intermediate artifacts.',
    speedRating: 4,
    complexityRating: 2,
    iconName: 'Workflow',
    bestUseCases: ['معالجة وتجهيز البيانات (ETL)', 'أتمتة خطوط بناء التطبيقات CI/CD', 'توليد التقارير الشاملة']
  }
];
