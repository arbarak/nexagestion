export type SupportedLanguage = 'en' | 'fr' | 'ar';

export interface TranslationKey {
  key: string;
  en: string;
  fr: string;
  ar: string;
}

export class I18nService {
  private currentLanguage: SupportedLanguage = 'en';
  private translations: Map<string, TranslationKey> = new Map();
  private supportedLanguages: SupportedLanguage[] = ['en', 'fr', 'ar'];

  constructor() {
    this.initializeTranslations();
  }

  /**
   * Initialize all translations
   */
  private initializeTranslations(): void {
    // Authentication
    this.addTranslation('auth.login', 'Login', 'Connexion', 'تسجيل الدخول');
    this.addTranslation('auth.signup', 'Sign Up', 'S\'inscrire', 'اشتراك');
    this.addTranslation('auth.logout', 'Logout', 'Déconnexion', 'تسجيل الخروج');
    this.addTranslation('auth.password', 'Password', 'Mot de passe', 'كلمة المرور');
    this.addTranslation('auth.email', 'Email', 'E-mail', 'البريد الإلكتروني');
    this.addTranslation('auth.forgot_password', 'Forgot Password?', 'Mot de passe oublié ?', 'هل نسيت كلمة المرور؟');
    this.addTranslation('auth.reset_password', 'Reset Password', 'Réinitialiser le mot de passe', 'إعادة تعيين كلمة المرور');
    this.addTranslation('auth.remember_me', 'Remember me', 'Se souvenir de moi', 'تذكرني');

    // Dashboard
    this.addTranslation('dashboard.title', 'Dashboard', 'Tableau de bord', 'لوحة التحكم');
    this.addTranslation('dashboard.welcome', 'Welcome', 'Bienvenue', 'أهلا وسهلا');
    this.addTranslation('dashboard.today', 'Today', "Aujourd'hui", 'اليوم');
    this.addTranslation('dashboard.this_month', 'This Month', 'Ce mois', 'هذا الشهر');
    this.addTranslation('dashboard.this_year', 'This Year', 'Cette année', 'هذا العام');

    // Sales
    this.addTranslation('sales.title', 'Sales', 'Ventes', 'المبيعات');
    this.addTranslation('sales.orders', 'Orders', 'Commandes', 'الطلبات');
    this.addTranslation('sales.invoices', 'Invoices', 'Factures', 'الفواتير');
    this.addTranslation('sales.total_revenue', 'Total Revenue', 'Revenu total', 'إجمالي الإيرادات');
    this.addTranslation('sales.new_order', 'New Order', 'Nouvelle commande', 'طلب جديد');
    this.addTranslation('sales.order_number', 'Order Number', 'Numéro de commande', 'رقم الطلب');
    this.addTranslation('sales.order_date', 'Order Date', 'Date de commande', 'تاريخ الطلب');
    this.addTranslation('sales.order_status', 'Order Status', 'Statut de la commande', 'حالة الطلب');
    this.addTranslation('sales.draft', 'Draft', 'Brouillon', 'مسودة');
    this.addTranslation('sales.pending', 'Pending', 'En attente', 'معلقة');
    this.addTranslation('sales.confirmed', 'Confirmed', 'Confirmé', 'مؤكدة');
    this.addTranslation('sales.shipped', 'Shipped', 'Expédié', 'مرسلة');
    this.addTranslation('sales.delivered', 'Delivered', 'Livré', 'تم التسليم');
    this.addTranslation('sales.cancelled', 'Cancelled', 'Annulé', 'ملغاة');

    // Inventory
    this.addTranslation('inventory.title', 'Inventory', 'Inventaire', 'المخزون');
    this.addTranslation('inventory.products', 'Products', 'Produits', 'المنتجات');
    this.addTranslation('inventory.stock', 'Stock', 'Stock', 'المخزون');
    this.addTranslation('inventory.low_stock', 'Low Stock', 'Stock faible', 'مخزون منخفض');
    this.addTranslation('inventory.out_of_stock', 'Out of Stock', 'Rupture de stock', 'غير موجود');
    this.addTranslation('inventory.quantity', 'Quantity', 'Quantité', 'الكمية');
    this.addTranslation('inventory.product_name', 'Product Name', 'Nom du produit', 'اسم المنتج');
    this.addTranslation('inventory.price', 'Price', 'Prix', 'السعر');
    this.addTranslation('inventory.category', 'Category', 'Catégorie', 'الفئة');
    this.addTranslation('inventory.brand', 'Brand', 'Marque', 'العلامة التجارية');

    // Customers
    this.addTranslation('customers.title', 'Customers', 'Clients', 'العملاء');
    this.addTranslation('customers.new_customer', 'New Customer', 'Nouveau client', 'عميل جديد');
    this.addTranslation('customers.name', 'Name', 'Nom', 'الاسم');
    this.addTranslation('customers.email', 'Email', 'E-mail', 'البريد الإلكتروني');
    this.addTranslation('customers.phone', 'Phone', 'Téléphone', 'الهاتف');
    this.addTranslation('customers.address', 'Address', 'Adresse', 'العنوان');
    this.addTranslation('customers.city', 'City', 'Ville', 'المدينة');
    this.addTranslation('customers.country', 'Country', 'Pays', 'البلد');

    // Financial
    this.addTranslation('financial.title', 'Financial', 'Financier', 'المالية');
    this.addTranslation('financial.accounts', 'Accounts', 'Comptes', 'الحسابات');
    this.addTranslation('financial.journal', 'Journal', 'Journal', 'اليوميات');
    this.addTranslation('financial.reports', 'Reports', 'Rapports', 'التقارير');
    this.addTranslation('financial.balance', 'Balance', 'Solde', 'الرصيد');
    this.addTranslation('financial.income', 'Income', 'Revenu', 'الدخل');
    this.addTranslation('financial.expenses', 'Expenses', 'Dépenses', 'المصروفات');
    this.addTranslation('financial.profit', 'Profit', 'Bénéfice', 'الربح');

    // Actions
    this.addTranslation('actions.add', 'Add', 'Ajouter', 'إضافة');
    this.addTranslation('actions.edit', 'Edit', 'Modifier', 'تعديل');
    this.addTranslation('actions.delete', 'Delete', 'Supprimer', 'حذف');
    this.addTranslation('actions.save', 'Save', 'Enregistrer', 'حفظ');
    this.addTranslation('actions.cancel', 'Cancel', 'Annuler', 'إلغاء');
    this.addTranslation('actions.submit', 'Submit', 'Soumettre', 'إرسال');
    this.addTranslation('actions.back', 'Back', 'Retour', 'رجوع');
    this.addTranslation('actions.next', 'Next', 'Suivant', 'التالي');
    this.addTranslation('actions.previous', 'Previous', 'Précédent', 'السابق');
    this.addTranslation('actions.search', 'Search', 'Chercher', 'بحث');
    this.addTranslation('actions.export', 'Export', 'Exporter', 'تصدير');
    this.addTranslation('actions.import', 'Import', 'Importer', 'استيراد');
    this.addTranslation('actions.download', 'Download', 'Télécharger', 'تحميل');
    this.addTranslation('actions.upload', 'Upload', 'Téléverser', 'رفع');

    // Messages
    this.addTranslation('messages.success', 'Success', 'Succès', 'نجح');
    this.addTranslation('messages.error', 'Error', 'Erreur', 'خطأ');
    this.addTranslation('messages.warning', 'Warning', 'Avertissement', 'تحذير');
    this.addTranslation('messages.info', 'Info', 'Info', 'معلومة');
    this.addTranslation('messages.loading', 'Loading...', 'Chargement...', 'جاري التحميل...');
    this.addTranslation('messages.confirm_delete', 'Are you sure?', 'Êtes-vous sûr?', 'هل أنت متأكد؟');
    this.addTranslation('messages.no_data', 'No data', 'Aucune donnée', 'لا توجد بيانات');
    this.addTranslation('messages.required_field', 'This field is required', 'Ce champ est requis', 'هذا الحقل مطلوب');

    // Common words
    this.addTranslation('common.date', 'Date', 'Date', 'التاريخ');
    this.addTranslation('common.time', 'Time', 'Heure', 'الوقت');
    this.addTranslation('common.total', 'Total', 'Total', 'الإجمالي');
    this.addTranslation('common.subtotal', 'Subtotal', 'Sous-total', 'المجموع الجزئي');
    this.addTranslation('common.tax', 'Tax', 'Taxe', 'الضريبة');
    this.addTranslation('common.discount', 'Discount', 'Remise', 'الخصم');
    this.addTranslation('common.currency', 'MAD', 'MAD', 'درهم');
    this.addTranslation('common.language', 'Language', 'Langue', 'اللغة');
  }

  /**
   * Add or update a translation
   */
  private addTranslation(key: string, en: string, fr: string, ar: string): void {
    this.translations.set(key, { key, en, fr, ar });
  }

  /**
   * Set current language
   */
  setLanguage(language: SupportedLanguage): void {
    if (this.supportedLanguages.includes(language)) {
      this.currentLanguage = language;
    }
  }

  /**
   * Get current language
   */
  getLanguage(): SupportedLanguage {
    return this.currentLanguage;
  }

  /**
   * Get supported languages
   */
  getAvailableLanguages(): SupportedLanguage[] {
    return this.supportedLanguages;
  }

  /**
   * Translate a key
   */
  t(key: string, defaultValue?: string): string {
    const translation = this.translations.get(key);

    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return defaultValue || key;
    }

    return translation[this.currentLanguage];
  }

  /**
   * Translate with parameters
   */
  tp(key: string, params: Record<string, string | number>, defaultValue?: string): string {
    let text = this.t(key, defaultValue);

    for (const [param, value] of Object.entries(params)) {
      text = text.replace(`{{${param}}}`, String(value));
    }

    return text;
  }

  /**
   * Get all translations for current language
   */
  getAllTranslations(): Record<string, string> {
    const result: Record<string, string> = {};

    for (const [key, translation] of this.translations) {
      result[key] = translation[this.currentLanguage];
    }

    return result;
  }

  /**
   * Get all translations for all languages
   */
  getFullTranslations(): Map<string, TranslationKey> {
    return new Map(this.translations);
  }

  /**
   * Check if translation exists
   */
  has(key: string): boolean {
    return this.translations.has(key);
  }

  /**
   * Get language direction (LTR or RTL)
   */
  getDirection(): 'ltr' | 'rtl' {
    return this.currentLanguage === 'ar' ? 'rtl' : 'ltr';
  }

  /**
   * Get language name
   */
  getLanguageName(language?: SupportedLanguage): string {
    const lang = language || this.currentLanguage;
    const names = {
      en: 'English',
      fr: 'Français',
      ar: 'العربية',
    };
    return names[lang];
  }

  /**
   * Get language flag emoji
   */
  getLanguageFlag(language?: SupportedLanguage): string {
    const lang = language || this.currentLanguage;
    const flags = {
      en: '🇬🇧',
      fr: '🇫🇷',
      ar: '🇲🇦',
    };
    return flags[lang];
  }

  /**
   * Register custom translations
   */
  registerTranslations(translations: TranslationKey[]): void {
    for (const translation of translations) {
      this.translations.set(translation.key, translation);
    }
  }

  /**
   * Get translations as JSON
   */
  toJSON(): Record<string, Record<SupportedLanguage, string>> {
    const result: Record<string, Record<SupportedLanguage, string>> = {};

    for (const [key, translation] of this.translations) {
      result[key] = {
        en: translation.en,
        fr: translation.fr,
        ar: translation.ar,
      };
    }

    return result;
  }
}

export const i18nService = new I18nService();
