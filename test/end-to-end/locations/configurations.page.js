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

// Select location in location component
async function selectLocationLabel(model, label, rank) {
  // select the item of the dropdown menu matching the label

  // get the HTML <div> element that will trigger the select input
  const select = element(by.model(model)).get(rank);

  // trigger the <input> rendering
  await select.click();

  // select the item of the dropdown menu matching the label
  let searchString = label;
  let labelForRegex = label.replace('(', '\\(');
  labelForRegex = labelForRegex.replace(')', '\\)');

  switch ('contains') {
  case 'exact':
    searchString = new RegExp(`^\\s*${labelForRegex}$`, 'm');
    break;
  case 'fullWord':
    searchString = new RegExp(`\\s+${labelForRegex}(\\s|$)`);
    break;
  case 'accountName':
    searchString = new RegExp(`\\d+\\s+${labelForRegex}\\s+`);
    break;
  default:
  case 'contains':
    searchString = label;
    break;
  }

  const option = select.element(
    by.cssContainingText(
      '.dropdown-menu [role="option"]', searchString,
    ),
  );
  await option.click();

}

class LocationFormManagementPage {
  constructor() {
    this.gridId = 'location-configuration-grid';
    this.rubricGrid = element(by.id(this.gridId));
    this.actionLinkColumn = 5;
  }

  /**
   * simulate the create Survey Form button click to show the dialog of creation
   */
  async createLocationRoot(locationForm) {
    await FU.buttons.create();

    await FU.input('ConfigLocationsModalCtrl.locations.name', locationForm.name);
    await FU.input('ConfigLocationsModalCtrl.locations.latitude', locationForm.latitude);
    await FU.input('ConfigLocationsModalCtrl.locations.longitude', locationForm.longitude);
    await components.locationTypeSelect.set(locationForm.type);

    await FU.buttons.submit();
    await components.notification.hasSuccess();
  }

  async createLocationLevel01(locationForm) {
    await FU.buttons.create();

    await FU.input('ConfigLocationsModalCtrl.locations.name', locationForm.name);
    await FU.input('ConfigLocationsModalCtrl.locations.latitude', locationForm.latitude);
    await FU.input('ConfigLocationsModalCtrl.locations.longitude', locationForm.longitude);
    await components.locationTypeSelect.set(locationForm.type);

    await components.yesNoRadios.set('no', 'is_highest');

    await components.locationConfigurationSelect.set(locationForm.parent);

    await FU.buttons.submit();
    await components.notification.hasSuccess();
  }

  async createLocationLevel02(locationForm) {
    await FU.buttons.create();

    await FU.input('ConfigLocationsModalCtrl.locations.name', locationForm.name);
    await FU.input('ConfigLocationsModalCtrl.locations.latitude', locationForm.latitude);
    await FU.input('ConfigLocationsModalCtrl.locations.longitude', locationForm.longitude);
    await components.locationTypeSelect.set(locationForm.type);

    await components.yesNoRadios.set('no', 'is_highest');

    await components.locationConfigurationSelect.set(locationForm.parent);

    await FU.uiSelect('leave.model', locationForm.parent01);

    await FU.buttons.submit();
    await components.notification.hasSuccess();
  }

  async createLocationLevel03(locationForm) {
    await FU.buttons.create();

    await FU.input('ConfigLocationsModalCtrl.locations.name', locationForm.name);
    await FU.input('ConfigLocationsModalCtrl.locations.latitude', locationForm.latitude);
    await FU.input('ConfigLocationsModalCtrl.locations.longitude', locationForm.longitude);
    await components.locationTypeSelect.set(locationForm.type);

    await components.yesNoRadios.set('no', 'is_highest');

    await components.locationConfigurationSelect.set(locationForm.parent);

    await element(by.model('leave.model')).get(0).click();

    // await element.all(by.model('leave.model')).get(0).click();

    // await FU.uiSelect('leave.model', locationForm.parent01, null, null, 0);
    // await FU.uiSelect('leave.model', locationForm.parent02, null, null, 1);

    browser.sleep('25000');

    console.log('BOMMmmmmmmmmmmmm');

    // element.all(by.model('leave.model')).get(1).click();
    // element(by.model(model))

    // await FU.uiSelect('leave.model'[0], locationForm.parent01, '', '', '', 0);
    // await FU.uiSelect('leave.model'[1], locationForm.parent02, '', '', '', 1);

    // await FU.buttons.submit();
    // await components.notification.hasSuccess();
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
    await element(by.id('is_required')).click();
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
    await element(by.id('is_required')).click();
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

module.exports = LocationFormManagementPage;
