import { PresetScript } from '../types';

export const PRESET_SCRIPTS: PresetScript[] = [
  {
    id: 'preset-py-node-bash',
    titleAr: 'منظومة معالجة هجينة: بايثون للذكاء الاصطناعي + نود لبث البيانات + باش للأنابيب',
    titleEn: 'Python AI Core + Node.js Streaming Gateway + Bash Pipe Glue',
    badge: 'الأكثر شعبية',
    descriptionAr: 'يستغل سرعة معالجة بايثون الحسابية وتوليد الإشارات، ويضخها لحظياً عبر أنابيب لينكس إلى خادم Node.js المتزامن لبثها عبر WebSockets و SSE.',
    languages: ['python', 'javascript', 'bash'],
    paradigm: 'subprocess_pipes',
    prompt: 'اصنع سكربت يدمج بايثون لتحليل البيانات ومحاكاة أسعار وأحجام التداول في الوقت الفعلي مع خادم Node.js لاستقبال الدفق وتوزيعه عبر SSE، ويتم تشغيل المنظومة بـ Bash Script.'
  },
  {
    id: 'preset-rust-py-ffi',
    titleAr: 'محرك حسابي فائق: رست أصلي (Rust Core) + واجهة تحكم بايثون (FFI / C-Types)',
    titleEn: 'Ultra-Fast Rust Cruncher + Python In-Memory C-Types FFI Bridge',
    badge: 'أعلى أداء وذاكرة',
    descriptionAr: 'استدعاء مكتبة مجمعة بـ Rust مباشرة داخل كود بايثون عبر C-Types بدون أي فقد في السرعة أو استهلاك للذاكرة، لمعالجة ملايين السجلات في أجزاء من الثانية.',
    languages: ['rust', 'python', 'bash'],
    paradigm: 'ffi_bindings',
    prompt: 'اصنع مشروعاً يدمج Rust و Python: مكتبة Rust compiled shared library تقوم بحسابات رياضية مكثفة (Simulated Heavy Hashing / Monte Carlo) ويتم استدعاؤها مباشرة من بايثون عبر ctypes أو FFI بدون وسيط، مع سكربت أتمتة البناء والتنفيذ.'
  },
  {
    id: 'preset-polyglot-single',
    titleAr: 'السكربت الهجين العبقري: ملف واحد يشتغل كـ Bash شل وبايثون في نفس الوقت!',
    titleEn: 'Single-File Polyglot Quine: Executes as Bash Shell & Python Simultaneously',
    badge: 'ابتكار هندسي',
    descriptionAr: 'ملف كودي واحد هجين عبقري لا يتطلب أي تبعات إضافية، يشتغل كـ Bash Script عند استدعائه بالشل، أو كـ Python script مباشرة عند استدعائه بمترجم بايثون.',
    languages: ['bash', 'python'],
    paradigm: 'polyglot_single_file',
    prompt: 'اصنع سكربت Polyglot أحادي الملف (single file) ينفذ بأمر bash myfile.sh.py أو python3 myfile.sh.py، يجمع معلومات النظام ويجري فحصاً شاملاً للعمليات والذاكرة والمعالجة المتوازية.'
  },
  {
    id: 'preset-go-py-sqlite',
    titleAr: 'جامع ومحلل البيانات المتوازي: جو (Go) للتزامن + بايثون (Python) لتحليل المشاعر والـ NLP',
    titleEn: 'High-Concurrency Go Ingestion + Python NLP Analytics Pipeline + SQLite',
    badge: 'بيانات ضخمة',
    descriptionAr: 'محرك Go يستفيد من Goroutines لجلب البيانات من مئات المصادر في ثوانٍ، ثم يمررها إلى محرك Python لتحليل النصوص واللغة الطبيعية وتخزينها في قاعدة بيانات SQLite.',
    languages: ['go', 'python', 'sql', 'bash'],
    paradigm: 'pipeline_orchestration',
    prompt: 'اصنع سكربت معالجة بيانات يدمج Go (لجلب ومعالجة البيانات المتزامنة بسرعة جنونية عبر Goroutines) و Python (لتطبيق خوارزميات الذكاء الاصطناعي وتحليل النصوص) مع حفظ النتائج في SQLite وإدارتها بواسطة Makefile.'
  },
  {
    id: 'preset-cpp-py-engine',
    titleAr: 'محرك محاكاة C++ عالي السرعة + غلاف بايثون للرسم البياني وتفاعل المستخدم',
    titleEn: 'High-Performance C++ Simulation Engine + Python Plotting & Controls',
    badge: 'خوارزميات ورياضيات',
    descriptionAr: 'كود C++ نقي عالي السرعة لمعالجة المعادلات التفاضلية أو الجزيئات الفيزيائية أو حسابات الشموع، مع جسر بايثون لاستقبال المخرجات وتوليد إحصائيات بصرية تفاعلية.',
    languages: ['cpp', 'python', 'bash'],
    paradigm: 'subprocess_pipes',
    prompt: 'اصنع سكربت يدمج C++ و Python: برنامج C++ يقوم بمحاكاة فيزيائية أو تسعيرية سريعة جداً ويضخ البيانات عبر stdout، بينما يقرؤه كود بايثون لمعالجة النتائج وتنسيقها وعرض تقرير إحصائي متكامل.'
  },
  {
    id: 'preset-bash-node-microservice',
    titleAr: 'مراقب أمني وأتمتة خوادم: باش (Bash Daemon) + واجهة مراقبة نود (Node.js Dashboard)',
    titleEn: 'Server Security Sentinel: Bash System Daemon + Node.js Real-time Dashboard',
    badge: 'DevOps وأمان',
    descriptionAr: 'سكربت Bash يعمل كـ Daemon لمراقبة اتصالات الشبكة، محاولات الاختراق، واستهلاك الموارد، ويبث التنبيهات عبر Unix Domain Socket إلى خادم Node.js خفيف.',
    languages: ['bash', 'javascript'],
    paradigm: 'microservice_ipc',
    prompt: 'اصنع سكربت مراقبة أمنية متقدم يدمج Bash daemon يراقب اتصالات الشبكة ومحاولات الدخول وحالة النظام في لينكس، ويتواصل مع خادم Node.js عبر Unix Domain Socket أو Localhost لعرض تنبيهات أمنية فورية.'
  }
];
