/* global element, by */

/**
 * This class is represents a user page in term of structure and
 * behaviour so it is a user page object
 */

/* loading grid actions */
const GridRow = require('../shared/GridRow');
const FU = require('../shared/FormUtils');

function UserPage() {
  const page = this;
  const grid = element(by.id('users-grid'));

  /* send back the number of user in the grid */
  function getUserCount() {
    return grid
      .element(by.css('.ui-grid-render-container-body'))
      .all(by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index'))
      .count();
  }

  /**
   * simulate the add user button click to show the dialog of creation
   */
  function createUser() {
    return FU.buttons.create();
  }

  /**
   * @method editUser
   *
   * @description
   * Edits a user by their display_name.
   */
  function editUser(name) {
    const row = new GridRow(name);
    row.dropdown().click();
    row.edit().click();
  }

  /**
   * @method editUserDepot
   *
   * @description
   * Clicks on the user's depot permissions
   */
  function editUserDepot(name) {
    const row = new GridRow(name);
    row.dropdown().click();
    row.menu.$('[data-method="depot"]').click();
  }

  /**
   * @method editUserCashbox
   *
   * @description
   * Clicks on the user edit cashbox permission by their name.
   */
  function editUserCashbox(name) {
    const row = new GridRow(name);
    row.dropdown().click();
    row.menu.$('[data-method="cashbox"]').click();
  }

  /**
   * @method toggleUser
   *
   * @description
   * Toggles a user on or off.
   */
  function toggleUser(name, on = true) {
    const row = new GridRow(name);
    row.dropdown().click();
    const key = on ? 'activate' : 'deactivate';
    row.menu.$(`[data-method="${key}"]`).click();
  }

  page.getUserCount = getUserCount;
  page.createUser = createUser;
  page.editUser = editUser;
  page.editUserDepot = editUserDepot;
  page.editUserCashbox = editUserCashbox;
  page.toggleUser = toggleUser;
}

module.exports = UserPage;
