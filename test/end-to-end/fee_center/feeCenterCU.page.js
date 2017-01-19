
/* jshint expr:true */
/* global element, by, browser */

/**
 * This class is represents a fee center creation page in terms of structure and
 * behaviour so it is a fee center creation page object
 **/
function CreateUpdateFeeCenterPage() {
  'use strict';

  const page = this;

  var feeCenterLabelField = element(by.model('FeeCenterModalCtrl.feeCenter.label'));
  var project = $('body').element(by.model('FeeCenterModalCtrl.feeCenter.project_id'));
  var costRadioButton = element(by.id('cost-radio'));
  var profitRadioButton = element(by.id('profit-radio'));
  var principalcheckBox = element(by.id('principal-id'));
  var feeCenterNoteArea = element(by.model('FeeCenterModalCtrl.feeCenter.note'));

  var submitButton = $('[uib-modal-window] [data-method="submit"]');
  var cancelButton = element(by.id('feeCenter-cancel'));

  var sameFeeCenterPanel = element(by.id('feeCenter-same'));

  /** set a fee center label value**/
  function setFeeCenterLabel(feeCenterLabel) {
    return feeCenterLabelField.clear().sendKeys(feeCenterLabel);
  }

  /** set a project choice **/
  function setProjectValue(value, append) {
    project.click();

    if (append) {
      project.element(by.model('$select.search')).sendKeys(value);
    } else {
      project.element(by.model('$select.search')).clear().sendKeys(value);
    }
    return project.element(by.cssContainingText('.dropdown-menu [role="option"]', value)).click();
  }

  /** choose a cost center**/
  function chooseCostCenter() {
    return costRadioButton.click();
  }

  /** choose a profit center **/
  function chooseProfitCenter() {
    return profitRadioButton.click();
  }

  /** check the principal check box**/
  function checkPrincipal() {
    return principalcheckBox.click();
  }

  /** set the the note for the fee center **/
  function setFeeCenterNote(note) {
    return feeCenterNoteArea.clear().sendKeys(note);
  }

  /** submit a fee center **/
  function submitFeeCenter() {
    return submitButton.click();
  }

  /** cancel creation **/
  function close() {
    return cancelButton.click();
  }

  /** check if the page is displayed**/
  function isDisplayed() {
    return submitButton.isPresent();
  }

  /** check if the fee center field is invalid **/
  function isFeeCenterLabelInvalid() {
    return isInvalid(feeCenterLabelField);
  }

  /** check if the project field is invalid **/
  function isProjectInvalid() {
    return isInvalid(project);
  }

  /** check if the fee center is invalid **/
  function isCostRadioInvalid() {
    return isInvalid(costRadioButton);
  }

  /** check if the fee center field is invalid **/
  function isProfitRadioInvalid() {
    return isInvalid(profitRadioButton);
  }

  /** check if ng-invalid css class is applied on a component **/
  function isInvalid(component) {
    return component.getAttribute('class').then(function (classes) {
      return classes.split(' ').indexOf('ng-invalid') !== -1;
    });
  }

  /** check if the user tried to edited the same fee center**/
  function isSameFeeCenter() {
    return sameFeeCenterPanel.isPresent();
  }

  page.close = close;
  page.setFeeCenterLabel = setFeeCenterLabel;
  page.isDisplayed = isDisplayed;
  page.chooseCostCenter = chooseCostCenter;
  page.chooseProfitCenter = chooseProfitCenter;
  page.checkPrincipal = checkPrincipal;
  page.setFeeCenterNote = setFeeCenterNote;
  page.isProjectInvalid = isProjectInvalid;
  page.submitFeeCenter = submitFeeCenter;
  page.isFeeCenterLabelInvalid = isFeeCenterLabelInvalid;
  page.isCostRadioInvalid = isCostRadioInvalid;
  page.isProfitRadioInvalid = isProfitRadioInvalid;
  page.isSameFeeCenter = isSameFeeCenter;
  page.setProjectValue = setProjectValue;
}

module.exports = CreateUpdateFeeCenterPage;
