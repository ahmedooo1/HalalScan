export type Locale = 'fr' | 'ar'

type Dict = Record<string, string>

const fr: Dict = {
  'app.about': 'À propos',
  'scan.aim': "Vise le code-barres du produit. Le scan se fait automatiquement.",
  'scan.notWorking': 'Le scan ne marche pas ?',
  'scan.barcodePlaceholder': 'Code-barres (ex: 3017620422003)',
  'scan.ok': 'OK',
  'scan.orPhoto': "Ou prendre en photo la liste d'ingrédients directement",
  'lookup.searching': 'Recherche du produit...',
  'ocr.noIngredients': "Pas d'ingrédients listés pour ce produit",
  'ocr.notFound': 'Produit non trouvé dans les bases',
  'ocr.instruction': "Prends en photo la liste d'ingrédients sur l'emballage pour une analyse directe.",
  'ocr.photograph': 'Photographier les ingrédients',
  'ocr.scanAnother': 'Scanner un autre produit',
  'ocr.error': 'La lecture du texte a échoué. Réessaie avec une photo plus nette.',
  'ocrProcessing.reading': 'Lecture du texte...',
  'result.nonHalal': 'Ingrédient non-halal détecté',
  'result.toVerify': 'À vérifier',
  'result.ok': 'Rien de suspect trouvé',
  'result.unknown': 'Ingrédients introuvables',
  'result.flaggedTitle': 'Ingrédients relevés',
  'result.disclaimer': "Analyse automatique basée sur {source}, pas une certification officielle. En cas de doute, vérifie l'emballage ou contacte le fabricant.",
  'result.sourcePhoto': 'une photo',
  'result.scanAnother': 'Scanner un autre produit',
  'footer.intro': 'HalalScan croise le code-barres avec les bases publiques',
  'footer.and': 'et',
  'footer.scope': '(alimentaire, cosmétique, autres produits) et repère les ingrédients à surveiller.',
  'footer.outro': "Ce n'est pas un organisme de certification halal : c'est un outil d'aide à la vérification, pas une garantie.",
  'camera.opening': 'Ouverture de la caméra...',
  'camera.deniedTitle': 'Accès caméra refusé',
  'camera.deniedBody': 'Autorise la caméra dans les réglages de ton navigateur pour scanner un produit.',
  'camera.errorTitle': 'Caméra indisponible',
  'camera.errorDefault': 'Impossible de démarrer la caméra.',
  'reason.pork': 'Porc ou dérivé du porc',
  'reason.alcohol': "Alcool en tant qu'ingrédient",
  'reason.blood': 'Sang ou plasma sanguin',
  'reason.gelatin': "Gélatine : vérifie qu'elle est bovine halal ou de poisson (pas porcine)",
  'reason.rennet': "Présure : vérifie qu'elle est microbienne/végétale ou animale halal",
  'reason.pepsin': "Pepsine : enzyme parfois d'origine porcine",
  'reason.lcysteine': "L-cystéine (E920) : peut venir de plumes/cheveux ou être synthétique",
  'reason.e441': 'E441 : gélatine',
  'reason.e542': 'E542 : phosphate osseux, origine animale',
  'reason.e904': "E904 (gomme laque) : d'origine insecte, statut débattu",
  'reason.e471': 'E471 : peut être d\'origine animale ou végétale selon le fabricant',
  'reason.naturalFlavor': "Arômes naturels : peuvent contenir un support alcoolique ou une base animale",
  'reason.animalFat': "Graisse animale d'origine non précisée",
  'reason.animalEmulsifier': "Émulsifiant d'origine possiblement animale",
  'reason.halalMention': 'Mention halal trouvée',
  'reason.fishGelatin': 'Gélatine de poisson (halal)',
  'reason.nonAnimalRennet': 'Présure non-animale',
}

const ar: Dict = {
  'app.about': 'حول التطبيق',
  'scan.aim': 'وجّه الكاميرا نحو الباركود. المسح يتم تلقائياً.',
  'scan.notWorking': 'المسح لا يعمل؟',
  'scan.barcodePlaceholder': 'الباركود (مثال: 3017620422003)',
  'scan.ok': 'موافق',
  'scan.orPhoto': 'أو التقط صورة لقائمة المكونات مباشرة',
  'lookup.searching': 'جارٍ البحث عن المنتج...',
  'ocr.noIngredients': 'لا توجد مكونات مدرجة لهذا المنتج',
  'ocr.notFound': 'المنتج غير موجود في قواعد البيانات',
  'ocr.instruction': 'التقط صورة لقائمة المكونات على العبوة للحصول على تحليل مباشر.',
  'ocr.photograph': 'تصوير المكونات',
  'ocr.scanAnother': 'مسح منتج آخر',
  'ocr.error': 'فشلت قراءة النص. حاول مرة أخرى بصورة أوضح.',
  'ocrProcessing.reading': 'جارٍ قراءة النص...',
  'result.nonHalal': 'تم اكتشاف مكوّن غير حلال',
  'result.toVerify': 'يحتاج إلى تحقق',
  'result.ok': 'لم يُعثر على أي شيء مشبوه',
  'result.unknown': 'تعذر العثور على المكونات',
  'result.flaggedTitle': 'المكونات المرصودة',
  'result.disclaimer': 'تحليل تلقائي استناداً إلى {source}، وليس شهادة رسمية. في حال الشك، تحقق من العبوة أو تواصل مع الشركة المصنعة.',
  'result.sourcePhoto': 'صورة',
  'result.scanAnother': 'مسح منتج آخر',
  'footer.intro': 'يقارن HalalScan الباركود مع قواعد البيانات العامة',
  'footer.and': 'و',
  'footer.scope': '(أغذية، مستحضرات تجميل، منتجات أخرى) ويرصد المكونات التي تستحق الانتباه.',
  'footer.outro': 'هذا ليس هيئة اعتماد حلال: إنه أداة مساعدة للتحقق، وليس ضماناً.',
  'camera.opening': 'جارٍ فتح الكاميرا...',
  'camera.deniedTitle': 'تم رفض الوصول إلى الكاميرا',
  'camera.deniedBody': 'فعّل إذن الكاميرا في إعدادات متصفحك لمسح منتج.',
  'camera.errorTitle': 'الكاميرا غير متاحة',
  'camera.errorDefault': 'تعذّر تشغيل الكاميرا.',
  'reason.pork': 'لحم خنزير أو أحد مشتقاته',
  'reason.alcohol': 'كحول كمكوّن',
  'reason.blood': 'دم أو بلازما دم',
  'reason.gelatin': 'جيلاتين: تأكد أنه بقري حلال أو من السمك (وليس من الخنزير)',
  'reason.rennet': 'منفحة (إنفحة): تأكد أنها ميكروبية/نباتية أو حيوانية حلال',
  'reason.pepsin': 'بيبسين: إنزيم قد يكون من أصل خنزيري أحياناً',
  'reason.lcysteine': 'ل-سيستئين (E920): قد يأتي من الريش/الشعر أو يكون اصطناعياً',
  'reason.e441': 'E441: جيلاتين',
  'reason.e542': 'E542: فوسفات عظمي، من أصل حيواني',
  'reason.e904': 'E904 (الصمغ اللاكي): من أصل حشري، وضعه محل نقاش',
  'reason.e471': 'E471: قد يكون من أصل حيواني أو نباتي حسب الشركة المصنعة',
  'reason.naturalFlavor': 'نكهات طبيعية: قد تحتوي على حامل كحولي أو قاعدة حيوانية',
  'reason.animalFat': 'دهون حيوانية من أصل غير محدد',
  'reason.animalEmulsifier': 'مستحلب قد يكون من أصل حيواني',
  'reason.halalMention': 'تم العثور على ذكر لكلمة حلال',
  'reason.fishGelatin': 'جيلاتين سمك (حلال)',
  'reason.nonAnimalRennet': 'منفحة غير حيوانية',
}

const dicts: Record<Locale, Dict> = { fr, ar }

const locale = ref<Locale>('fr')
let initialized = false

export function useI18n() {
  if (!initialized && import.meta.client) {
    initialized = true
    const saved = localStorage.getItem('halalscan_locale')
    if (saved === 'fr' || saved === 'ar') locale.value = saved
  }

  function setLocale(l: Locale) {
    locale.value = l
    if (import.meta.client) localStorage.setItem('halalscan_locale', l)
  }

  function t(key: string, params?: Record<string, string>): string {
    let str = dicts[locale.value][key] ?? dicts.fr[key] ?? key
    if (params) {
      for (const [k, v] of Object.entries(params)) str = str.replace(`{${k}}`, v)
    }
    return str
  }

  const dir = computed(() => (locale.value === 'ar' ? 'rtl' : 'ltr'))

  return { locale, setLocale, t, dir }
}
