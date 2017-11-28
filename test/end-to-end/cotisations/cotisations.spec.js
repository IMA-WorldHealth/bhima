const helpers = require('../shared/helpers');
const CotisationPage = require('./cotisations.page');
const chai = require('chai');


/** configuring helpers**/
helpers.configure(chai);

describe('Cotisations Management', () => {
  // navigate to the page
  before(() => helpers.navigate('#!/cotisations'));

  const Page = new CotisationPage();

  const cotisation = {
    label : 'Cotisation Syndical',
    abbr  : 'CoSynd',
    is_employee : 1,
    is_percent : 1,
    four_account_id : '41002',
    six_account_id : '67003',
    value : 6.5
  };

  const updateCotisation = {
    label : 'Chef Comptable',
    is_percent : 0
  };

  it('successfully creates a new Cotisation', () => {
    Page.createCotisation(cotisation);
  });

  it('successfully edits a Cotisation', () => {
    Page.editCotisation(cotisation.label, updateCotisation);
  });

  it('don\'t create when incorrect Cotisation', () => {
    Page.errorOnCreateCotisation();
  });

  it('successfully delete a Cotisation', () => {
    Page.deleteCotisation(updateCotisation.label);
  });

});