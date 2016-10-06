/* jshint expr:true */
/* global element, by, browser */

/**
 * This class is represents a user page in term of structure and
 * behaviour so it is a user page object
 **/

function UserPage() {
  'use strict';

  const page = this;

  var userGrid = element(by.id('users-grid'));
  var addUserButon = element(by.css('[data-method="create"]'));

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
    const editLinkColumn = 2; //column indexing begin with 0

    const row = userGrid
      .$('.ui-grid-render-container-body')
      .element(by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index')
        .row(n));

    row
      .element(by.repeater('(colRenderIndex, col) in colContainer.renderedColumns track by col.uid')
      .row(editLinkColumn))
      .element(by.css('[data-method="edit"]'))
      .click();
  }

  /**
   * simulte a link clicking on the grid to show permission dialog
   **/
  function editUserPermission(n) {

    const editUserPermissionLinkColumn = 3;

    const row = userGrid
      .$('.ui-grid-render-container-body')
      .element(by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index')
      .row(n));

    row
      .element(by.repeater('(colRenderIndex, col) in colContainer.renderedColumns track by col.uid')
      .row(editUserPermissionLinkColumn))
      .element(by.css('[data-method="permission"]'))
      .click();
  }

  page.getUserCount = getUserCount;
  page.createUser = createUser;
  page.editUser = editUser;
  page.editUserPermission = editUserPermission;
}

module.exports = UserPage;
