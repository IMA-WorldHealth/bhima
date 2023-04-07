const TU = require('../shared/TestUtils');
const { by } = require('../shared/TestUtils');

/**
 * This class is represents an accountReference creation page in terms of structure and
 * behaviour so it is an accountReference creation page object
 */
const Filters = require('../shared/components/bhFilters');
const components = require('../shared/components');

class CreateUpdateAccountReferencePage {
  constructor() {
    this.filters = new Filters();
  }

  async init() {
    this.abbr = await TU.locator(by.model('AccountReferenceModalCtrl.accountReference.abbr'));
    this.description = await TU.locator(by.model('AccountReferenceModalCtrl.accountReference.description'));
    this.isAmoDep = await TU.locator(by.model('AccountReferenceModalCtrl.accountReference.is_amo_dep'));
    this.accounts = await TU.locator(by.model('AccountReferenceModalCtrl.accountReference.accounts'));
    this.accountsException = await TU.locator(by.model('AccountReferenceModalCtrl.accountReference.accountsException'));
    this.parent = await TU.locator(by.model('AccountReferenceModalCtrl.accountReference.parent'));

    this.sameAccountReferencePanel = await TU.locator(by.id('account-reference-same'));

    this.modal = (await TU.locator('[uib-modal-window] .modal-header'));

    this.buttons = {
      submit: (await TU.locator('[uib-modal-window] [data-method="submit"]')),
      cancel: (await TU.locator('[uib-modal-window] [data-method="cancel"]')),
    };

    this.uiSelectCloseButtons = await (await TU.locator(by.css('[class="close ui-select-match-close"]'))).all();
  }

  /* set an accountReference abbr value */
  async setAbbr(abbrValue) {
    await this.abbr.clear();
    return this.abbr.type(abbrValue);
  }

  /* set an accountReference description value */
  async setDescription(descriptionValue) {
    await this.description.clear();
    return this.description.type(descriptionValue);
  }

  /* set an accountReference is amortissement/depreciation value */
  async clickIsAmoDep() {
    return this.isAmoDep.click();
  }

  async clearSelectedItems() {
    return Promise.all(this.uiSelectCloseButtons.map(closeItem => closeItem.click()));
  }

  /* set accounts */
  async setAccountValues(values) {
    await this.accounts.click();
    await Promise.all(values.map(
      async v => TU.uiSelect('AccountReferenceModalCtrl.accountReference.accounts', v)));

    // await TU.series(values, v => TU.uiSelect('AccountReferenceModalCtrl.accountReference.accounts', v));
    return this.modal.click();
  }

  /* set accounts exceptions */
  async setAccountExceptionValues(values) {
    await this.accountsException.click();
    await TU.series(values, v => TU.uiSelect('AccountReferenceModalCtrl.accountReference.accountsException', v));
    return this.modal.click();
  }

  /* set the parent of the reference */
  async setParentValue(value) {
    await this.parent.click();
    await TU.uiSelect('AccountReferenceModalCtrl.accountReference.parent', value);
    return this.modal.click();
  }

  /* search an accountReference abbr value */
  async searchAbbr(abbrValue) {
    return TU.input('$ctrl.searchQueries.abbr', abbrValue);
  }

  /* search an accountReference description value */
  async searchDescription(descriptionValue) {

    return TU.input('$ctrl.searchQueries.description', descriptionValue);
  }

  /* search an accountReference by account number value */
  async searchAccount(accountValue) {
    return TU.uiSelect('$ctrl.select.account', accountValue, (await TU.locator('body')), false, 'fullWord');
  }

  /* search an accountReference by Reference Type */
  async searchReferenceType(typeValue) {
    return components.accountReferenceTypeSelect.set(typeValue, 'reference_type_id');
  }

  async clearFilter() {
    return this.filters.resetFilters();
  }

  /* submit */
  async submit() {
    return this.buttons.submit.click();
  }

  /* cancel creation */
  async close() {
    return this.buttons.cancel.click();
  }

  /* check if the page is displayed */
  async isDisplayed() {
    return this.buttons.submit.isPresent();
  }

  /* check if the accountReference tried to edited the same accountReference */
  async isSameAccountReference() {
    return this.sameAccountReferencePanel.isVisible();
  }
}

module.exports = CreateUpdateAccountReferencePage;
