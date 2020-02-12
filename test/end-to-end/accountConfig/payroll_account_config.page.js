/**
 * This class is represents an account configuration page in term of structure and
 * behaviour so it is a account configuration page object
 */

/* loading grid actions */
const FU = require('../shared/FormUtils');
const { notification, accountSelect, modalAction } = require('../shared/components');

const GridRow = require('../shared/GridRow');

class AccountConfigPage {
  constructor() {
    this.gridId = 'account-config-grid';
  }

  /**
   * simulate the create accountConfig button click to show the dialog of creation
   */
  async createAccountConfig(accountConfig) {
    await FU.buttons.create();
    await FU.input('AccountConfigModalCtrl.accountConfig.label', accountConfig.label);
    await accountSelect.set(accountConfig.account_id);
    await FU.buttons.submit();
    await notification.hasSuccess();
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
    const row = new GridRow(label);
    await row.dropdown().click();
    await row.edit().click();

    await FU.input('AccountConfigModalCtrl.accountConfig.label', updateAccountConfig.label);
    await accountSelect.set(updateAccountConfig.account_id);

    await FU.buttons.submit();
    await notification.hasSuccess();
  }

  /**
   * simulate a click on the delete link of a function
   */
  async deleteAccountConfig(label) {
    const row = new GridRow(label);
    await row.dropdown().click();
    await row.remove().click();

    await modalAction.confirm();
    await notification.hasSuccess();
  }
}

module.exports = AccountConfigPage;
