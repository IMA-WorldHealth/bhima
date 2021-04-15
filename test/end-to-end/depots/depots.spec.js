const helpers = require('../shared/helpers');
const DepotPage = require('./depots.page');

const UserPage = require('../user/user.page.js');

describe('Depots Management', () => {
  // navigate to the page
  before(() => helpers.navigate('#!/depots'));

  const page = new DepotPage();

  /**
   * The implementation of the E2E test of the assignment of a Depot
   * to a user is added in the E2E test of the Depot and not in the
   * user test because the E2E test on the users runs after the Depot test.
   * @todo Add tests for distribution depots which require enterprise settings enabled
   */
  const userPage = new UserPage();

  const depot = {
    text : 'E2E_new_depot',
    is_warehouse : 0,
    default_purchase_interval : 0,
  };

  const DEPOT_SECONDAIRE = 'Depot Secondaire';

  const updateDepot = {
    text : 'E2E_updated_depot',
    is_warehouse : 1,
    default_purchase_interval : 2,
  };

  const setParentUpdateDepot = {
    depot : 'E2E_updated_depot',
    parent : 'Depot Principal',
    default_purchase_interval : 0,
  };

  const depotByParent = {
    text : 'Depot Principal 2',
    parent : 'Depot Principal',
    default_purchase_interval : 0,
  };

  it('successfully creates a new depot', async () => {
    await page.createDepot(depot.text, false, true, helpers.data.locations, depot.default_purchase_interval);
  });

  it('successfully creates a new depot by depot Parent', async () => {
    await page.createDepotByParent(depotByParent, true, helpers.data.locations);
  });

  it('successfully edits a depot', async () => {
    await page.editDepot(depot.text, updateDepot.text, updateDepot.default_purchase_interval);
  });

  it('Edits a depot, set depot without parent', async () => {
    await page.editDepotClearParent(depotByParent.text);
  });

  it.skip('join a location to a depot', async () => {
    await page.joinLocation(DEPOT_SECONDAIRE, helpers.data.locations);
  });

  it('Join depot to depot Parent', async () => {
    await page.joinParent(setParentUpdateDepot);
  });

  it.skip('remove a location to a depot', async () => {
    await page.removeLocation(DEPOT_SECONDAIRE);
  });

  it('don\'t create when incorrect depot name', async () => {
    await page.errorOnCreateDepot();
  });

  it('successfully delete a depot', async () => {
    await page.deleteDepot(updateDepot.text);
  });

  it('successfully delete a depot create by parent', async () => {
    await page.deleteDepot(depotByParent.text);
  });

  /**
   * this will not work since we have already added the
   * depot soncondaire to the user in test/data.sql,
   * so nothing will appear in the typeahead input
   */
  it.skip('set the depot manage by user', async () => {
    await helpers.navigate('#!/users');
    await userPage.updateDepot('Super User');
    await page.selectDepot(DEPOT_SECONDAIRE, 'user_depots');
    await page.submitUserDepot();
  });
});
