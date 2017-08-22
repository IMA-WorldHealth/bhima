/* global element, by, inject, browser */
const chai = require('chai');

const helpers = require('../shared/helpers');
const DepotPage = require('./depots.page');

helpers.configure(chai);

describe('Depots Management', () => {
  // navigate to the page
  before(() => helpers.navigate('#!/depots'));

  const Page = new DepotPage();

  const depot = {
    text : 'E2E_new_depot',
    is_warehouse : 0,
  };

  const updateDepot = {
    text : 'E2E_updated_depot',
    is_warehouse : 1,
  };

  const LAST_RECORD = 0; // based on alphabetical sort and position

  it('successfully creates a new depot', () => {
    Page.createDepot(depot.text, false);
  });

  it('successfully edits a depot', () => {
    Page.editDepot(LAST_RECORD, updateDepot.text);
  });

  it('don\'t create when incorrect depot name', () => {
    Page.errorOnCreateDepot();
  });

  it('successfully delete a depot', () => {
    Page.deleteDepot(LAST_RECORD);
  });
});
