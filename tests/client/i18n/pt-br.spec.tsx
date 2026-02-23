import englishTranslations from '../../../src/client/i18n/en';
import ptTranslations from '../../../src/client/i18n/pt-br';

describe('i18n translations', () => {
  const enKeys = () => Object.keys(englishTranslations.translation);
  const ptKeys = () => Object.keys(ptTranslations.translation);

  it('should have translation objects in both locales', () => {
    expect(englishTranslations.translation).toBeDefined();
    expect(ptTranslations.translation).toBeDefined();
    expect(englishTranslations.translation).toBeInstanceOf(Object);
    expect(ptTranslations.translation).toBeInstanceOf(Object);
  });

  it('should have the same keys in en and pt-br', () => {
    expect(enKeys().length).toEqual(ptKeys().length);
    enKeys().forEach(key => {
      expect(ptTranslations.translation).toHaveProperty(key);
    });
    ptKeys().forEach(key => {
      expect(englishTranslations.translation).toHaveProperty(key);
    });
  });

  it('should have non-empty string values for every key in both locales', () => {
    const en = englishTranslations.translation as Record<string, string>;
    const pt = ptTranslations.translation as Record<string, string>;
    enKeys().forEach(key => {
      expect(en[key]).toEqual(expect.any(String));
      expect(en[key].length).toBeGreaterThan(0);
      expect(pt[key]).toEqual(expect.any(String));
      expect(pt[key].length).toBeGreaterThan(0);
    });
  });
});
