const translate = require('../../server/lib/helpers/translate');
const { expect } = require('chai');

const newLocal = function () {
  it('#getTranslationHelper() should return a function.', () => {
    const type = typeof translate('fr');
    const expectedType = 'function';
    expect(type).to.equal(expectedType);
  });

  it('#Using an unknown language key should default to English.', () => {
    const translateCode = 'FORM.BUTTONS.ADD';
    var fct = translate('spanish');
    var translated = fct(translateCode);
    const expected = 'Add';
    expect(translated).to.equal(expected);
  });

  it('#The function returned by .getTranslationHelper("en") should translate a string in English.', () => {
    const translateCode = 'FORM.BUTTONS.ADD';
    var fct = translate('en');
    var translated = fct(translateCode);
    const expected = 'Add';
    expect(translated).to.equal(expected);
  });

  it('#The function returned by .getTranslationHelper("fr") should translate a string in French.', () => {
    const translateCode = 'FORM.BUTTONS.ADD';
    var fct = translate('fr');
    var translated = fct(translateCode);
    const expected = 'Ajouter';
    expect(translated).to.equal(expected);
  });

};

describe('lib/helpers/translate.js', newLocal);
