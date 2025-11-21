export interface Translation {
  id: string;
  companyId: string;
  language: string;
  namespace: string;
  key: string;
  value: string;
  context?: string;
  pluralForm?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
  enabled: boolean;
}

export class LocalizationService {
  private translations: Map<string, Translation> = new Map();
  private languages: Map<string, Language> = new Map();
  private cache: Map<string, any> = new Map();

  private defaultLanguages: Language[] = [
    { code: 'en', name: 'English', nativeName: 'English', direction: 'ltr', enabled: true },
    { code: 'es', name: 'Spanish', nativeName: 'Español', direction: 'ltr', enabled: true },
    { code: 'fr', name: 'French', nativeName: 'Français', direction: 'ltr', enabled: true },
    { code: 'de', name: 'German', nativeName: 'Deutsch', direction: 'ltr', enabled: true },
    { code: 'it', name: 'Italian', nativeName: 'Italiano', direction: 'ltr', enabled: true },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português', direction: 'ltr', enabled: true },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', direction: 'rtl', enabled: true },
    { code: 'zh', name: 'Chinese', nativeName: '中文', direction: 'ltr', enabled: true },
    { code: 'ja', name: 'Japanese', nativeName: '日本語', direction: 'ltr', enabled: true },
  ];

  constructor() {
    this.defaultLanguages.forEach(lang => {
      this.languages.set(lang.code, lang);
    });
  }

  async addTranslation(
    companyId: string,
    language: string,
    namespace: string,
    key: string,
    value: string,
    context?: string,
    pluralForm?: string
  ): Promise<Translation> {
    const id = `${language}-${namespace}-${key}`;
    const translation: Translation = {
      id,
      companyId,
      language,
      namespace,
      key,
      value,
      context,
      pluralForm,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.translations.set(id, translation);
    this.cache.clear();
    console.log(`Added translation: ${id}`);
    return translation;
  }

  async getTranslation(
    companyId: string,
    language: string,
    namespace: string,
    key: string
  ): Promise<string | null> {
    const id = `${language}-${namespace}-${key}`;
    const translation = this.translations.get(id);
    if (translation && translation.companyId === companyId) {
      return translation.value;
    }
    return null;
  }

  async getNamespaceTranslations(
    companyId: string,
    language: string,
    namespace: string
  ): Promise<Record<string, string>> {
    const result: Record<string, string> = {};
    for (const [, translation] of this.translations) {
      if (
        translation.companyId === companyId &&
        translation.language === language &&
        translation.namespace === namespace
      ) {
        result[translation.key] = translation.value;
      }
    }
    return result;
  }

  async updateTranslation(
    companyId: string,
    language: string,
    namespace: string,
    key: string,
    value: string
  ): Promise<Translation | null> {
    const id = `${language}-${namespace}-${key}`;
    const translation = this.translations.get(id);
    if (!translation || translation.companyId !== companyId) {
      return null;
    }

    const updated = {
      ...translation,
      value,
      updatedAt: new Date(),
    };

    this.translations.set(id, updated);
    this.cache.clear();
    console.log(`Updated translation: ${id}`);
    return updated;
  }

  async deleteTranslation(
    companyId: string,
    language: string,
    namespace: string,
    key: string
  ): Promise<void> {
    const id = `${language}-${namespace}-${key}`;
    const translation = this.translations.get(id);
    if (translation && translation.companyId === companyId) {
      this.translations.delete(id);
      this.cache.clear();
      console.log(`Deleted translation: ${id}`);
    }
  }

  getLanguages(): Language[] {
    return Array.from(this.languages.values());
  }

  getLanguage(code: string): Language | null {
    return this.languages.get(code) || null;
  }

  async enableLanguage(code: string): Promise<Language | null> {
    const language = this.languages.get(code);
    if (language) {
      language.enabled = true;
      this.cache.clear();
      return language;
    }
    return null;
  }

  async disableLanguage(code: string): Promise<Language | null> {
    const language = this.languages.get(code);
    if (language) {
      language.enabled = false;
      this.cache.clear();
      return language;
    }
    return null;
  }

  async getTranslationStats(companyId: string): Promise<{
    totalTranslations: number;
    languageStats: Record<string, number>;
    namespaceStats: Record<string, number>;
  }> {
    let totalTranslations = 0;
    const languageStats: Record<string, number> = {};
    const namespaceStats: Record<string, number> = {};

    for (const [, translation] of this.translations) {
      if (translation.companyId === companyId) {
        totalTranslations++;
        languageStats[translation.language] = (languageStats[translation.language] || 0) + 1;
        namespaceStats[translation.namespace] = (namespaceStats[translation.namespace] || 0) + 1;
      }
    }

    return { totalTranslations, languageStats, namespaceStats };
  }
}

export const localizationService = new LocalizationService();

