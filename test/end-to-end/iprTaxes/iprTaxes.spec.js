const helpers = require('../shared/helpers');
const IprTaxPage = require('./iprTaxes.page');
const chai = require('chai');


/** configuring helpers**/
helpers.configure(chai);

describe.only('Ipr Tax Management', () => {
  // navigate to the page
  before(() => helpers.navigate('#!/ipr_tax'));

  const Page = new IprTaxPage();

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

  it('successfully creates a new IPR Scale 1995', () => {
    Page.createIprTax(iprTax1);
  });

  it('successfully creates a new IPR Scale 2000', () => {
    Page.createIprTax(iprTax2);
  });

  it('successfully creates a new IPR Scale 2013', () => {
    Page.createIprTax(iprTax3);
  });

  it('successfully edits an IPR Tax', () => {
    Page.editIprTax(iprTax1.label, updateIPR);
  });

  it('successfully delete a Ipr tax Scale', () => {
    Page.deleteIprTax(updateIPR.label);
  });

  it('don\'t create when incorrect Ipr Tax', () => {
    Page.errorOnCreateIprTax();
  });
});