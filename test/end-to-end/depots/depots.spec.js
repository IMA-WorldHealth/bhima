const helpers = require('../shared/helpers');
const DepotPage = require('./depots.page');
const chai = require('chai');

/** loading User pages **/
const UserPage = require('../user/user.page.js');
const UserCreateUpdatePage = require('../user/userCU.page.js');

/** configuring helpers**/
helpers.configure(chai);
const expect = chai.expect;

describe('Depots Management', () => {
  // navigate to the page
  before(() => helpers.navigate('#!/depots'));

  const Page = new DepotPage();
  /**
  /* The implementation of the E2E test of the assignment of a repository
  /* to a user is added in the E2E test of the repository and not in the 
  /* user test because the E2E test on the users runs after the repository test. 
  */
  const userPage = new UserPage();
  const userCreateUpdatePage = new UserCreateUpdatePage();

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

  it('Set the depot manage by User', () => {
    helpers.navigate('#!/users');
    
    userPage.editUserDepot(0);
    Page.selectUserDepot(['Depot Secondaire']);
    Page.submitUserDepot();
  });

});
