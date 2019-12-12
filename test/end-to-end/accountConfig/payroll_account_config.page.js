/* global element, by */
/* eslint  */

/**
 * This class is represents an account configuration page in term of structure and
 * behaviour so it is a account configuration page object
 */

/* loading grid actions */
const GA = require('../shared/GridAction');
const GU = require('../shared/GridUtils');
const FU = require('../shared/FormUtils');
const components = require('../shared/components');

class AccountConfigPage {
  constructor() {
    this.gridId = 'account-config-grid';
    this.rubricGrid = element(by.id(this.gridId));
    this.actionLinkColumn = 2;
  }

  /**
   * send back the number of account configurations in the grid
   */
  getRubricCount() {
    return this.rubricGrid
      .element(by.css('.ui-grid-render-container-body'))
      .all(by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index'))
      .count();
  }

  /**
   * simulate the create accountConfig button click to show the dialog of creation
   */
  async createAccountConfig(accountConfig) {
    await FU.buttons.create();
    await FU.input('AccountConfigModalCtrl.accountConfig.label', accountConfig.label);
    await components.accountSelect.set(accountConfig.account_id, 'account_id');
    await FU.buttons.submit();
    await components.notification.hasSuccess();
  }

  /**
   * block creation without the function name
   */
  async errorOnCreateAccountConfig() {
    await FU.buttons.create();
    await FU.buttons.submit();
    await FU.validation.error('AccountConfigModalCtrl.accountConfig.label');
    await FU.buttons.cancel();
  }

  /**
   * simulate a click on the edit link of a function
   */
  async editAccountConfig(label, updateAccountConfig) {
    const { rowIndex } = await GU.getGridIndexesMatchingText(this.gridId, label);
    await GA.clickOnMethod(rowIndex, this.actionLinkColumn, 'edit', this.gridId);
    await FU.input('AccountConfigModalCtrl.accountConfig.label', updateAccountConfig.label);
    await components.accountSelect.set(updateAccountConfig.account_id, 'account_id');

    await FU.buttons.submit();
    await components.notification.hasSuccess();
  }

  /**
   * simulate a click on the delete link of a function
   */
  async deleteAccountConfig(label) {
    const { rowIndex } = await GU.getGridIndexesMatchingText(this.gridId, label);
    await GA.clickOnMethod(rowIndex, this.actionLinkColumn, 'delete', this.gridId);
    await components.modalAction.confirm();
    await components.notification.hasSuccess();
  }
}

module.exports = AccountConfigPage;
