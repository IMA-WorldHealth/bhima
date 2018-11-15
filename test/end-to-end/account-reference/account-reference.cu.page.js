/* global element, by, $$ */

/**
 * This class is represents a accountReference creation page in terms of structure and
 * behaviour so it is a accountReference creation page object
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
  setAccountValues(values) {
    this.accounts.click();
    values.forEach(v => {
      FU.uiSelectAppended('AccountReferenceModalCtrl.accountReference.accounts', v);
    });
  }

  /* set accounts exceptions */
  setAccountExceptionValues(values) {
    this.accountsException.click();
    values.forEach(v => {
      FU.uiSelectAppended('AccountReferenceModalCtrl.accountReference.accountsException', v);
    });
  }

  /* set the parent of the reference */
  setParentValue(value) {
    this.parent.click();
    return FU.uiSelectAppended('AccountReferenceModalCtrl.accountReference.parent', value);
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
