/* global element, by */

/**
 * This class is represents a accountReference page in term of structure and
 * behaviour so it is a accountReference page object
 */

/* loading grid actions */
const GA = require('../shared/GridAction');

function AccountReferencePage() {
  const page = this;

  const accountReferenceGrid = element(by.id('account-reference-grid'));
  const addAccountReferenceButton = element(by.css('[data-method="create"]'));
  const actionLinkColumn = 7;

  /* send back the number of accountReference in the grid */
  function getAccountReferenceCount() {
    return accountReferenceGrid
      .element(by.css('.ui-grid-render-container-body'))
      .all(by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index'))
      .count();
  }

  /**
   * simulate the add accountReference button click to show the dialog of creation
   */
  function createAccountReference() {
    return addAccountReferenceButton.click();
  }

  /**
   * simulate a click to a link tailed to the accountReference
   *  listed in the grid to show the dialog for an editing
   */
  function editAccountReference(n) {
    GA.clickOnMethod(n, actionLinkColumn, 'edit', 'account-reference-grid');
  }

  /**
   * simulate a click to a link tailed to the accountReference
   *  listed in the grid to show the dialog for a deletion
   */
  function deleteAccountReference(n) {
    GA.clickOnMethod(n, actionLinkColumn, 'delete', 'account-reference-grid');
  }

  page.getAccountReferenceCount = getAccountReferenceCount;
  page.createAccountReference = createAccountReference;
  page.editAccountReference = editAccountReference;
  page.deleteAccountReference = deleteAccountReference;
}

module.exports = AccountReferencePage;
