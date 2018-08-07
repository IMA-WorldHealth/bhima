
/* global element, by */

/**
 * This class is represents a accountReference creation page in terms of structure and
 * behaviour so it is a accountReference creation page object
 */
const FU = require('../shared/FormUtils');

function CreateUpdateAccountReferencePage() {
  const page = this;

  const abbr = element(by.model('AccountReferenceModalCtrl.accountReference.abbr'));
  const description = element(by.model('AccountReferenceModalCtrl.accountReference.description'));
  const isAmoDep = element(by.model('AccountReferenceModalCtrl.accountReference.is_amo_dep'));
  const accounts = element(by.model('AccountReferenceModalCtrl.accountReference.accounts'));
  const accountsException = element(by.model('AccountReferenceModalCtrl.accountReference.accountsException'));
  const parent = element(by.model('AccountReferenceModalCtrl.accountReference.parent'));

  const submitButton = $('[uib-modal-window] [data-method="submit"]');
  const cancelButton = element(by.id('account-reference-cancel'));

  const sameAccountReferencePanel = element(by.id('account-reference-same'));

  /* set an accountReference abbr value */
  function setAbbr(abbrValue) {
    return abbr.clear().sendKeys(abbrValue);
  }

  /* set an accountReference description value */
  function setDescription(descriptionValue) {
    return description.clear().sendKeys(descriptionValue);
  }

  /* set an accountReference is amortissement/depreciation value */
  function clickIsAmoDep() {
    return isAmoDep.click();
  }

  function clearSelectedItems() {
    const removeItemButtons = element.all(by.css('[class="close ui-select-match-close"]'));
    removeItemButtons.each(closeItem => closeItem.click());
  }

  /* set accounts */
  function setAccountValues(values) {
    accounts.click();
    values.forEach(v => {
      FU.uiSelectAppended('AccountReferenceModalCtrl.accountReference.accounts', v);
    });
  }

  /* set accounts exceptions */
  function setAccountExceptionValues(values) {
    accountsException.click();
    values.forEach(v => {
      FU.uiSelectAppended('AccountReferenceModalCtrl.accountReference.accountsException', v);
    });
  }

  /* set the parent of the reference */
  function setParentValue(value) {
    parent.click();
    FU.uiSelectAppended('AccountReferenceModalCtrl.accountReference.parent', value);
  }

  /* submit */
  function submit() {
    return FU.modal.submit();
  }

  /* cancel creation */
  function close() {
    return cancelButton.click();
  }

  /* check if the page is displayed */
  function isDisplayed() {
    return submitButton.isPresent();
  }

  /* check if the accountReference tried to edited the same accountReference */
  function isSameAccountReference() {
    return sameAccountReferencePanel.isPresent();
  }

  page.setAbbr = setAbbr;
  page.setDescription = setDescription;
  page.clickIsAmoDep = clickIsAmoDep;
  page.setAccountValues = setAccountValues;
  page.setAccountExceptionValues = setAccountExceptionValues;
  page.setParentValue = setParentValue;
  page.close = close;
  page.isDisplayed = isDisplayed;
  page.isSameAccountReference = isSameAccountReference;
  page.submit = submit;
  page.clearSelectedItems = clearSelectedItems;
}

module.exports = CreateUpdateAccountReferencePage;
