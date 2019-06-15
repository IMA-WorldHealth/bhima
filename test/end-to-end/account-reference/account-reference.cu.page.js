/* global element, by */

/**
 * This class is represents an accountReference creation page in terms of structure and
 * behaviour so it is an accountReference creation page object
 */
const FU = require('../shared/FormUtils');

class CreateUpdateAccountReferencePage {
  constructor() {
    this.abbr = element(by.model('AccountReferenceModalCtrl.accountReference.abbr'));
    this.description = element(by.model('AccountReferenceModalCtrl.accountReference.description'));
    this.isAmoDep = element(by.model('AccountReferenceModalCtrl.accountReference.is_amo_dep'));
    this.accounts = element(by.model('AccountReferenceModalCtrl.accountReference.accounts'));
    this.accountsException = element(by.model('AccountReferenceModalCtrl.accountReference.accountsException'));
    this.parent = element(by.model('AccountReferenceModalCtrl.accountReference.parent'));

    this.sameAccountReferencePanel = element(by.id('account-reference-same'));

    this.modal = $('[uib-modal-window] .modal-header');

    this.buttons = {
      submit : $('[uib-modal-window] [data-method="submit"]'),
      cancel : $('[uib-modal-window] [data-method="cancel"]'),
    };

    this.uiSelectCloseButtons = element.all(by.css('[class="close ui-select-match-close"]'));
  }

  /* set an accountReference abbr value */
  setAbbr(abbrValue) {
    return this.abbr.clear().sendKeys(abbrValue);
  }

  /* set an accountReference description value */
  setDescription(descriptionValue) {
    return this.description.clear().sendKeys(descriptionValue);
  }

  /* set an accountReference is amortissement/depreciation value */
  clickIsAmoDep() {
    return this.isAmoDep.click();
  }

  clearSelectedItems() {
    return this.uiSelectCloseButtons.map(closeItem => closeItem.click());
  }

  /* set accounts */
  async setAccountValues(values) {
    await this.accounts.click();

    await Promise.all(
      values.map(v => FU.uiSelect('AccountReferenceModalCtrl.accountReference.accounts', v))
    );

    await this.modal.click();
  }

  /* set accounts exceptions */
  async setAccountExceptionValues(values) {
    await this.accountsException.click();

    await Promise.all(
      values.map(v => FU.uiSelect('AccountReferenceModalCtrl.accountReference.accountsException', v))
    );

    await this.modal.click();
  }

  /* set the parent of the reference */
  async setParentValue(value) {
    await this.parent.click();
    await FU.uiSelect('AccountReferenceModalCtrl.accountReference.parent', value);
    await this.modal.click();
  }

  /* submit */
  submit() {
    return this.buttons.submit.click();
  }

  /* cancel creation */
  close() {
    return this.buttons.cancel.click();
  }

  /* check if the page is displayed */
  isDisplayed() {
    return this.buttons.submit.isPresent();
  }

  /* check if the accountReference tried to edited the same accountReference */
  isSameAccountReference() {
    return this.sameAccountReferencePanel.isPresent();
  }
}

module.exports = CreateUpdateAccountReferencePage;
