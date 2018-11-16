const { expect } = require('chai');
const helpers = require('../shared/helpers');
const IprTaxPage = require('./iprTaxes.page');

describe('Ipr Tax Management', () => {
  before(() => helpers.navigate('#!/ipr_tax'));

  const page = new IprTaxPage();

  const iprTax1 = {
    label         : 'IPR 1995',
    description   : 'Impot Professionnel sur le revenu 1995',
    currency_id   : 2,
  };

  const iprTax2 = {
    label         : 'IPR 2000',
    description   : 'Impot Professionnel sur le revenu 2000',
    currency_id   : 2,
  };

  const iprTax3 = {
    label         : 'IPR 2013',
    description   : 'Impot Professionnel sur le revenu 2013',
    currency_id   : 1,
  };

  const updateIPR = {
    label         : 'IPR 1995 Updated',
    description   : 'Impot Professionnel sur le revenu 2000',
    currency_id   : 2,
  };

  it('should start with one IPR taxes', () => {
    expect(page.count()).to.eventually.equal(1);
  });

  it('successfully creates a new IPR Scale 1995', () => {
    page.create(iprTax1);
  });

  it('successfully creates a new IPR Scale 2000', () => {
    page.create(iprTax2);
  });

  it('successfully creates a new IPR Scale 2013', () => {
    page.create(iprTax3);
  });

  it('successfully edits an IPR Tax', () => {
    page.update(iprTax1.label, updateIPR);
  });

  it('successfully delete a Ipr tax Scale', () => {
    page.remove(updateIPR.label);
  });

  it('don\'t create when incorrect Ipr Tax', () => {
    page.errorOnCreateIprTax();
  });

  it('should end with three IPR taxes', () => {
    expect(page.count()).to.eventually.equal(3);
  });
});
