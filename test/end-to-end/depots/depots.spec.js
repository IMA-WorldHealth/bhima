const helpers = require('../shared/helpers');
const DepotPage = require('./depots.page');
const chai = require('chai');

/** loading User pages * */
const UserPage = require('../user/user.page.js');

/** configuring helpers* */
helpers.configure(chai);

describe('Depots Management', () => {
  // navigate to the page
  before(() => helpers.navigate('#!/depots'));

  const Page = new DepotPage();
  /**
  /* The implementation of the E2E test of the assignment of a Depot
  /* to a user is added in the E2E test of the Depot and not in the
  /* user test because the E2E test on the users runs after the Depot test.
  */
  const userPage = new UserPage();

  const depot = {
    text : 'E2E_new_depot',
    is_warehouse : 0,
  };

  // const DEPOT_PRINCIPAL = 'Depot Principale';
  const DEPOT_SECONDAIRE = 'Depot Secondaire';

  const location = [
    'dbe330b6-5cde-4830-8c30-dc00eccd1a5f',
    'f6fc7469-7e58-45cb-b87c-f08af93edade',
    '0404e9ea-ebd6-4f20-b1f8-6dc9f9313450',
    '1f162a10-9f67-4788-9eff-c1fea42fcc9b',
  ];

  const updateDepot = {
    text : 'E2E_updated_depot',
    is_warehouse : 1,
  };

  it('successfully creates a new depot', () => {
    Page.createDepot(depot.text, false, true, location);
  });

  it('successfully edits a depot', () => {
    Page.editDepot(depot.text, updateDepot.text);
  });

  it('join a location to a depot', () => {
    Page.joinLocation(DEPOT_SECONDAIRE, location);
  });

  it('remove a location to a depot', () => {
    Page.removeLocation(DEPOT_SECONDAIRE);
  });

  it('don\'t create when incorrect depot name', () => {
    Page.errorOnCreateDepot();
  });

  it('successfully delete a depot', () => {
    Page.deleteDepot(updateDepot.text);
  });

  it('Set the depot manage by User', () => {
    helpers.navigate('#!/users');

    userPage.editUserDepot(0);
    Page.selectUserDepot([DEPOT_SECONDAIRE]);
    Page.submitUserDepot();
  });

});
