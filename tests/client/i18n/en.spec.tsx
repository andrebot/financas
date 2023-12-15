import chai from 'chai';
import englishTranslations from '../../../src/client/i18n/en'; // Adjust the path according to your project structure

const should = chai.should();

describe('English Translations', () => {
  it('should have specific properties', () => {
    should.exist(englishTranslations.translation);
    englishTranslations.should.be.an('object');

    // Check for the existence of specific properties
    englishTranslations.translation.should.have.property('loading').that.is.a('string');
    englishTranslations.translation.should.have.property('exampleText').that.is.a('string');
  });
});
