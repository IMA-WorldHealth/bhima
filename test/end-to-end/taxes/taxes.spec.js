const helpers = require('../shared/helpers');
const TaxPage = require('./taxes.page');
const chai = require('chai');


/** configuring helpers**/
helpers.configure(chai);

describe('Taxes Management', () => {
  // navigate to the page
  before(() => helpers.navigate('#!/taxes'));

  const Page = new TaxPage();

  const tax = {
    label           : 'Taxe Territoriale',
    abbr            : 'TaxTer',
    is_employee     : 0,
    is_percent      : 1,
    four_account_id : '41002',
    six_account_id  : '67003',
    value           : 6.5,
    is_ipr          : 0
  };

  const updateTax = {
    label         : 'Taxe Nationale',
    is_percent    : 0,
    is_employee   : 1
  };

  it('successfully creates a new Tax', () => {
    Page.createTax(tax);
  });

  it('successfully edits a Tax', () => {
    Page.editTax(tax.label, updateTax);
  });

  it('don\'t create when incorrect Tax', () => {
    Page.errorOnCreateTax();
  });

  it('successfully delete a Tax', () => {
    Page.deleteTax(updateTax.label);
  });

});