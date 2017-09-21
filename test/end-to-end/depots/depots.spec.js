const helpers = require('../shared/helpers');
const DepotPage = require('./depots.page');

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

  it('successfully creates a new depot', () => {
    Page.createDepot(depot.text, false);
  });

  it('successfully edits a depot', () => {
    Page.editDepot(depot.text, updateDepot.text);
  });

  it('don\'t create when incorrect depot name', () => {
    Page.errorOnCreateDepot();
  });

  it('successfully delete a depot', () => {
    Page.deleteDepot(updateDepot.text);
  });
});
