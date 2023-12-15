import chai from 'chai';
import englishTranslations from '../../../src/client/i18n/en';
import ptTranslations from '../../../src/client/i18n/pt-br';

const should = chai.should();

describe('English Translations', () => {
  it('should have specific properties', () => {
    should.exist(englishTranslations.translation);
    should.exist(ptTranslations.translation);

    englishTranslations.should.be.an('object');
    ptTranslations.should.be.an('object');

    Object.keys(englishTranslations.translation).length.should.equal(Object.keys(ptTranslations.translation).length);
    Object.keys(englishTranslations.translation).forEach(key => {
      ptTranslations.translation.should.have.property(key);
    });
  });
});
