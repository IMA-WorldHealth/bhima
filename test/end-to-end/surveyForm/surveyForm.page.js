/* global element, by */
/* eslint  */

/**
 * This class is represents a Survey Form page in term of structure and
 * behaviour so it is a Survey Form Management page object
 */

/* loading grid actions */
const GridRow = require('../shared/GridRow');
const FU = require('../shared/FormUtils');
const components = require('../shared/components');

class SurveyFormManagementPage {
  constructor() {
    this.gridId = 'choices-list-management-grid';
    this.rubricGrid = element(by.id(this.gridId));
    this.actionLinkColumn = 5;
  }

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
   * simulate the create Survey Form button click to show the dialog of creation
   */
  async createDeletable(SurveyForm) {
    await FU.buttons.create();
    await components.surveyFormTypeSelect.set(SurveyForm.type);
    await components.choiceListSelect.set(SurveyForm.choice_list_id);
    await components.surveyListSelect.set(SurveyForm.filter_choice_list_id);
    await FU.input('SurveyFormModalCtrl.surveyForm.name', SurveyForm.name);
    await FU.input('SurveyFormModalCtrl.surveyForm.label', SurveyForm.label);
    await element(by.id('is_required')).click();
    await FU.buttons.submit();
    await components.notification.hasSuccess();
  }

  /**
   * simulate a click on the edit link of a function
   */
  async edit(label, updateSurveyForm) {
    const row = new GridRow(label);
    row.dropdown().click();
    row.edit().click();
    await components.surveyFormTypeSelect.set(updateSurveyForm.type);
    await components.choiceListSelect.set(updateSurveyForm.choice_list_id);
    await FU.input('SurveyFormModalCtrl.surveyForm.name', updateSurveyForm.name);
    await FU.input('SurveyFormModalCtrl.surveyForm.label', updateSurveyForm.label);
    await FU.input('SurveyFormModalCtrl.surveyForm.hint', updateSurveyForm.hint);
    await element(by.id('is_required')).click();

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
