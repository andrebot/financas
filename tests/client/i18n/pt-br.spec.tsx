import englishTranslations from '../../../src/client/i18n/en';
import ptTranslations from '../../../src/client/i18n/pt-br';

describe('English Translations', () => {
  it('should have specific properties', () => {
    expect(englishTranslations.translation).toBeDefined();
    expect(ptTranslations.translation).toBeDefined();

    expect(englishTranslations.translation).toBeInstanceOf(Object);
    expect(ptTranslations.translation).toBeInstanceOf(Object);

    expect(Object.keys(englishTranslations.translation).length).toEqual(Object.keys(ptTranslations.translation).length);
    Object.keys(englishTranslations.translation).forEach(key => {
      expect(ptTranslations.translation).toHaveProperty(key);
    });
  });
});
