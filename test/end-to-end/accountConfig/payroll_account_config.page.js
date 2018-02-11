/* global element, by */

/**
 * This class is represents a account configuration page in term of structure and
 * behaviour so it is a account configuration page object
 */

const chai = require('chai');
const helpers = require('../shared/helpers');

helpers.configure(chai);

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
  createAccountConfig(accountConfig) {
    FU.buttons.create();
    FU.input('AccountConfigModalCtrl.accountConfig.label', accountConfig.label);
    components.accountSelect.set(accountConfig.account_id, 'account_id');
    FU.buttons.submit();
    components.notification.hasSuccess();
  }

  /**
   * block creation without the function name
   */
  errorOnCreateAccountConfig() {
    FU.buttons.create();
    FU.buttons.submit();
    FU.validation.error('AccountConfigModalCtrl.accountConfig.label');
    FU.buttons.cancel();
  }

  /**
   * simulate a click on the edit link of a function
   */
  editAccountConfig(label, updateAccountConfig) {
    GU.getGridIndexesMatchingText(this.gridId, label)
      .then(indices => {
        const { rowIndex } = indices;
        GA.clickOnMethod(rowIndex, this.actionLinkColumn, 'edit', this.gridId);
        FU.input('AccountConfigModalCtrl.accountConfig.label', updateAccountConfig.label);
        components.accountSelect.set(updateAccountConfig.account_id, 'account_id');

        FU.buttons.submit();
        components.notification.hasSuccess();
      });
  }

  /**
   * simulate a click on the delete link of a function
   */
  deleteAccountConfig(label) {
    GU.getGridIndexesMatchingText(this.gridId, label)
      .then(indices => {
        const { rowIndex } = indices;
        GA.clickOnMethod(rowIndex, this.actionLinkColumn, 'delete', this.gridId);
        components.modalAction.confirm();
        components.notification.hasSuccess();
      });
  }
}

module.exports = AccountConfigPage;
