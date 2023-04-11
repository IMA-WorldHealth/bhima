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

    this.modal = await TU.locator('[uib-modal-window] .modal-header');

    this.buttons = {
      submit : () => TU.locator('[uib-modal-window] [data-method="submit"]').click(),
      cancel : () => TU.locator('[uib-modal-window] [data-method="cancel"]').click(),
    };
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
  clickIsAmoDep() {
    return this.isAmoDep.click();
  }

  // await okayButton.evaluate((button:HTMLElement)=>button.click())

  async clearSelectedAccounts() {
    const selector = 'div[name="accounts"] [class="close ui-select-match-close"]';
    const closeButtons = await TU.locator(selector).all();
    return Promise.all(closeButtons.reverse().map(
      closeItem => closeItem.evaluate(node => node.click())));
  }

  // @todo : See if future versions of Playwright fix this problem
  //     closeItem.evaluate() is a hack:
  //        return closeItem.click();
  //     should work but is erratic
  // See https://github.com/microsoft/playwright/issues/13307

  numSelectedAccounts() {
    const selector = 'div[name="accounts"] [class="close ui-select-match-close"]:visible';
    return TU.locator(selector).count();
  }

  async clearSelectedAccountExceptions() {
    const selector = 'div[name="accountsException"] [class="close ui-select-match-close"]';
    const closeButtons = await TU.locator(selector).all();
    return Promise.all(closeButtons.reverse().map(
      closeItem => closeItem.evaluate(node => node.click())));
  }

  numSelectedAccountExceptions() {
    const selector = 'div[name="accountsException"] [class="close ui-select-match-close"]:visible';
    return TU.locator(selector).count();
  }

  /* set accounts */
  async setAccountValues(values) {
    await this.accounts.click();
    await Promise.all(values.map(
      async v => TU.uiSelect('AccountReferenceModalCtrl.accountReference.accounts', v)));
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
  searchAbbr(abbrValue) {
    return TU.input('$ctrl.searchQueries.abbr', abbrValue);
  }

  /* search an accountReference description value */
  searchDescription(descriptionValue) {
    return TU.input('$ctrl.searchQueries.description', descriptionValue);
  }

  /* search an accountReference by account number value */
  async searchAccount(accountValue) {
    // WAS: await FU.uiSelect('$ctrl.select.account', accountValue, $('body'), false, 'fullWord');
    // @TODO : get this working with fullWord again
    return TU.uiSelect('$ctrl.select.account', accountValue);
  }

  /* search an accountReference by Reference Type */
  searchReferenceType(typeValue) {
    return components.accountReferenceTypeSelect.set(typeValue, 'reference_type_id');
  }

  clearFilter() {
    return this.filters.resetFilters();
  }

  /* submit */
  submit() {
    return this.buttons.submit();
  }

  /* cancel creation */
  close() {
    return this.buttons.cancel();
  }

  /* check if the page is displayed */
  isDisplayed() {
    return this.buttons.submit.isPresent();
  }

  /* check if the accountReference tried to edited the same accountReference */
  isSameAccountReference() {
    return this.sameAccountReferencePanel.isVisible();
  }
}

module.exports = CreateUpdateAccountReferencePage;
