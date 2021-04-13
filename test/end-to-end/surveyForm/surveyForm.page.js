/* global element, by, browser */

/**
 * This class is represents a Survey Form page in term of structure and
 * behaviour so it is a Survey Form Management page object
 */

const EC = require('protractor').ExpectedConditions;
const GridRow = require('../shared/GridRow');
const FU = require('../shared/FormUtils');
const components = require('../shared/components');

class SurveyFormManagementPage {

  /**
   * simulate the create Survey Form button click to show the dialog of creation
   */
  async create(SurveyForm) {
    await components.dataCollector.set(SurveyForm.dataCollector);
    await FU.buttons.create();
    await components.surveyFormTypeSelect.set(SurveyForm.type);
    await FU.input('SurveyFormModalCtrl.surveyForm.name', SurveyForm.name);
    await FU.input('SurveyFormModalCtrl.surveyForm.label', SurveyForm.label);
    await FU.input('SurveyFormModalCtrl.surveyForm.hint', SurveyForm.hint);
    await element(by.id('is_required')).click();
    await FU.buttons.submit();
    await components.notification.hasSuccess();
  }

  /**
   * Verify the validation of the parameter name for several scenarios
   */
  async checkValidate(SurveyForm, surveyFormName) {
    await components.dataCollector.set(SurveyForm.dataCollector);
    await FU.buttons.create();
    await components.surveyFormTypeSelect.set(SurveyForm.type);
    await FU.input('SurveyFormModalCtrl.surveyForm.name', surveyFormName);
    await FU.input('SurveyFormModalCtrl.surveyForm.label', SurveyForm.label);
    await FU.input('SurveyFormModalCtrl.surveyForm.hint', SurveyForm.hint);
    const isRequiredField = element(by.id('is_required'));
    await browser.wait(EC.elementToBeClickable(isRequiredField), 2000, 'Cannot click is_required field');
    await isRequiredField.click();
    await FU.buttons.submit();
    await FU.exists(by.id('error_format'), true);
    await FU.modal.cancel();
  }

  /**
   * simulate the create Survey Form button click to show the dialog of creation
   */

  async createDeletable(SurveyForm) {
    await FU.buttons.create();
    await components.surveyFormTypeSelect.set(SurveyForm.type);
    await components.choiceListSelect.set(SurveyForm.choice_list_id);
    await components.surveyListSelect.set(SurveyForm.filter_choice_list_id);
    await FU.input('SurveyFormModalCtrl.surveyForm.name', SurveyForm.name);
    await FU.input('SurveyFormModalCtrl.surveyForm.label', SurveyForm.label);
    const isRequiredField = element(by.id('is_required'));
    await browser.wait(EC.elementToBeClickable(isRequiredField), 2000, 'Cannot click is_required field');
    await isRequiredField.click();
    await FU.buttons.submit();
    await components.notification.hasSuccess();
  }

  /**
   * simulate a click on the edit link of a function
   */
  async edit(label, updateSurveyForm) {
    const row = new GridRow(label);
    await row.dropdown().click();
    await row.edit().click();
    await components.surveyFormTypeSelect.set(updateSurveyForm.type);
    await components.choiceListSelect.set(updateSurveyForm.choice_list_id);
    await FU.input('SurveyFormModalCtrl.surveyForm.name', updateSurveyForm.name);
    await FU.input('SurveyFormModalCtrl.surveyForm.label', updateSurveyForm.label);
    await FU.input('SurveyFormModalCtrl.surveyForm.hint', updateSurveyForm.hint);
    const isRequiredField = element(by.id('is_required'));
    await browser.wait(EC.elementToBeClickable(isRequiredField), 2000, 'Cannot click is_required field');
    await isRequiredField.click();
    await FU.buttons.submit();
    await components.notification.hasSuccess();
  }

  /**
   * simulate a click on the delete link of a function
   */
  async delete(label) {
    const row = new GridRow(label);
    await row.dropdown().click();
    await row.remove().click();

    await FU.modal.submit();
    await components.notification.hasSuccess();
  }
}

module.exports = SurveyFormManagementPage;
