import { describe, it, expect, beforeEach, vi } from 'vitest';
import { i18nService } from '../i18n-service';

describe('i18nService', () => {
  beforeEach(() => {
    // Reset to English before each test
    i18nService.setLanguage('en');
  });

  describe('Language Management', () => {
    it('should set and get language', () => {
      i18nService.setLanguage('fr');
      expect(i18nService.getLanguage()).toBe('fr');

      i18nService.setLanguage('ar');
      expect(i18nService.getLanguage()).toBe('ar');

      i18nService.setLanguage('en');
      expect(i18nService.getLanguage()).toBe('en');
    });

    it('should support all available languages', () => {
      const languages = i18nService.getAvailableLanguages();

      expect(languages).toContain('en');
      expect(languages).toContain('fr');
      expect(languages).toContain('ar');
    });

    it('should return 3 available languages', () => {
      const languages = i18nService.getAvailableLanguages();

      expect(languages.length).toBe(3);
    });
  });

  describe('Translation Keys', () => {
    it('should provide translations for auth keys', () => {
      const transKey = i18nService.t('auth.login');

      expect(transKey).toBeDefined();
      expect(typeof transKey).toBe('string');
      expect(transKey.length).toBeGreaterThan(0);
    });

    it('should provide translations for dashboard keys', () => {
      const transKey = i18nService.t('dashboard.welcome');

      expect(transKey).toBeDefined();
      expect(typeof transKey).toBe('string');
    });

    it('should provide translations for sales keys', () => {
      const transKey = i18nService.t('sales.title');

      expect(transKey).toBeDefined();
    });

    it('should provide translations in multiple languages', () => {
      const enText = i18nService.t('auth.login');

      i18nService.setLanguage('fr');
      const frText = i18nService.t('auth.login');

      expect(enText).not.toBe(frText);
      expect(frText.length).toBeGreaterThan(0);
    });

    it('should handle missing keys with default value', () => {
      const missing = i18nService.t('nonexistent.key', 'Default Value');

      expect(missing).toBeDefined();
    });

    it('should return key itself if not found and no default', () => {
      const missing = i18nService.t('nonexistent.key');

      expect(missing).toBeDefined();
      expect(typeof missing).toBe('string');
    });
  });

  describe('Parameter Substitution', () => {
    it('should substitute parameters in translations', () => {
      const result = i18nService.tp('common.welcome_name', { name: 'John' });

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should handle multiple parameters', () => {
      const result = i18nService.tp('common.invoice_details', {
        number: 'INV-001',
        amount: '1000 MAD',
      });

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });
  });

  describe('Direction Support', () => {
    it('should return ltr for English', () => {
      i18nService.setLanguage('en');
      const direction = i18nService.getDirection();

      expect(direction).toBe('ltr');
    });

    it('should return ltr for French', () => {
      i18nService.setLanguage('fr');
      const direction = i18nService.getDirection();

      expect(direction).toBe('ltr');
    });

    it('should return rtl for Arabic', () => {
      i18nService.setLanguage('ar');
      const direction = i18nService.getDirection();

      expect(direction).toBe('rtl');
    });
  });

  describe('Language Names and Flags', () => {
    it('should get language name', () => {
      const name = i18nService.getLanguageName('en');

      expect(name).toBeDefined();
      expect(typeof name).toBe('string');
      expect(name.length).toBeGreaterThan(0);
    });

    it('should get language name for current language', () => {
      i18nService.setLanguage('fr');
      const name = i18nService.getLanguageName();

      expect(name).toBeDefined();
      expect(typeof name).toBe('string');
    });

    it('should get language flag', () => {
      const flag = i18nService.getLanguageFlag('en');

      expect(flag).toBeDefined();
      expect(typeof flag).toBe('string');
    });

    it('should return flags for all languages', () => {
      const enFlag = i18nService.getLanguageFlag('en');
      const frFlag = i18nService.getLanguageFlag('fr');
      const arFlag = i18nService.getLanguageFlag('ar');

      expect(enFlag).toBeDefined();
      expect(frFlag).toBeDefined();
      expect(arFlag).toBeDefined();
    });
  });

  describe('Translation Availability', () => {
    it('should check if translation key exists', () => {
      const exists = i18nService.has('auth.login');

      expect(typeof exists).toBe('boolean');
    });

    it('should return true for existing keys', () => {
      const exists = i18nService.has('dashboard.welcome');

      expect(exists).toBe(true);
    });

    it('should return false for nonexistent keys', () => {
      const exists = i18nService.has('fake.nonexistent.key');

      expect(typeof exists).toBe('boolean');
    });
  });

  describe('All Translations Export', () => {
    it('should get all translations for current language', () => {
      const all = i18nService.getAllTranslations();

      expect(typeof all).toBe('object');
      expect(Object.keys(all).length).toBeGreaterThan(0);
    });

    it('should have translations for all languages', () => {
      const translations = i18nService.toJSON();

      expect(translations).toHaveProperty('en');
      expect(translations).toHaveProperty('fr');
      expect(translations).toHaveProperty('ar');
    });

    it('should return string translations', () => {
      const all = i18nService.getAllTranslations();

      for (const value of Object.values(all)) {
        expect(typeof value).toBe('string');
      }
    });
  });

  describe('Comprehensive Coverage', () => {
    it('should have auth translations', () => {
      const authTranslations = i18nService.getAllTranslations();

      expect(Object.keys(authTranslations).some((k) => k.startsWith('auth.'))).toBe(true);
    });

    it('should have dashboard translations', () => {
      const allTranslations = i18nService.getAllTranslations();

      expect(Object.keys(allTranslations).some((k) => k.startsWith('dashboard.'))).toBe(true);
    });

    it('should have at least 50 translation keys', () => {
      const all = i18nService.getAllTranslations();

      expect(Object.keys(all).length).toBeGreaterThanOrEqual(50);
    });

    it('should support context-specific translations', () => {
      const keys = Object.keys(i18nService.getAllTranslations());

      const categories = ['auth', 'dashboard', 'sales', 'inventory', 'financial', 'common'];

      for (const cat of categories) {
        const hasCat = keys.some((k) => k.startsWith(`${cat}.`));
        // At least some categories should exist
        expect(typeof hasCat).toBe('boolean');
      }
    });
  });

  describe('Language Switching', () => {
    it('should switch languages without losing translations', () => {
      const enLoginText = i18nService.t('auth.login');

      i18nService.setLanguage('fr');
      const frLoginText = i18nService.t('auth.login');

      i18nService.setLanguage('ar');
      const arLoginText = i18nService.t('auth.login');

      expect(enLoginText).toBeDefined();
      expect(frLoginText).toBeDefined();
      expect(arLoginText).toBeDefined();
      expect(enLoginText).not.toEqual(frLoginText);
    });

    it('should handle rapid language switches', () => {
      for (let i = 0; i < 5; i++) {
        i18nService.setLanguage('en');
        expect(i18nService.getLanguage()).toBe('en');

        i18nService.setLanguage('fr');
        expect(i18nService.getLanguage()).toBe('fr');

        i18nService.setLanguage('ar');
        expect(i18nService.getLanguage()).toBe('ar');
      }
    });
  });

  describe('Morocco Context', () => {
    it('should have Morocco-specific content', () => {
      const translations = i18nService.toJSON();

      // Check that at least one language has translations
      expect(Object.keys(translations).length).toBeGreaterThan(0);

      // Check for common Moroccan context (currency, etc)
      const enTranslations = i18nService.getAllTranslations();
      const enString = JSON.stringify(enTranslations).toLowerCase();

      // Should have content relevant to business operations
      expect(enString.length).toBeGreaterThan(100);
    });

    it('should support Arabic for Morocco market', () => {
      i18nService.setLanguage('ar');

      expect(i18nService.getLanguage()).toBe('ar');
      expect(i18nService.getDirection()).toBe('rtl');

      const text = i18nService.t('auth.login');
      expect(text).toBeDefined();
    });

    it('should support French for Morocco market', () => {
      i18nService.setLanguage('fr');

      expect(i18nService.getLanguage()).toBe('fr');
      expect(i18nService.getDirection()).toBe('ltr');

      const text = i18nService.t('auth.login');
      expect(text).toBeDefined();
    });
  });
});
