/* global element, by, browser */

/**
 * This class is represents a user page in term of structure and
 * behaviour so it is a user page object
 **/

/** loading grid actions **/
const GA = require('../shared/GridAction');

function UserPage() {
  'use strict';

  const page = this;

  var userGrid = element(by.id('users-grid'));
  var addUserButon = element(by.css('[data-method="create"]'));
  var actionLinkColumn = 2;

  /** send back the number of user in the grid**/
  function getUserCount() {
    return userGrid
      .element(by.css('.ui-grid-render-container-body'))
      .all(by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index'))
      .count();
  }

  /**
   * simulate the add user button click to show the dialog of creation
   **/
  function createUser () {
    return addUserButon.click();
  }

  /**
   * simulate a click to a link tailed to the user
   *  listed in the grid to show the dialog for an editing
   **/
  function editUser(n) {
    GA.clickOnMethod(n, actionLinkColumn, 'edit', 'users-grid');
  }

  /**
   * simulte a link clicking on the grid to show permission dialog
   **/
  function editUserPermission(n) {
    GA.clickOnMethod(n, actionLinkColumn, 'permission', 'users-grid');
  }

  /**
   * simulte a link clicking on the grid to show activation dialog
   **/
  function activateUser(n) {
    GA.clickOnMethod(n, actionLinkColumn, 'activated', 'users-grid');
  }

  page.getUserCount = getUserCount;
  page.createUser = createUser;
  page.editUser = editUser;
  page.editUserPermission = editUserPermission;
  page.activateUser = activateUser;
}

module.exports = UserPage;
