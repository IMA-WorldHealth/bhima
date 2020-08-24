/* global element, by */
/* eslint  */

/**
 * This class is represents Locations configurations page in term of structure and
 * behaviour so it is a Location Form Management page object
 */

/* loading grid actions */
const GridRow = require('../shared/GridRow');
const FU = require('../shared/FormUtils');
const GU = require('../shared/GridUtils');
const components = require('../shared/components');
const { browser } = require('protractor');

// Select location in location component
async function selectLocationLabel(label) {
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

  return searchString;
}

class LocationFormManagementPage {
  constructor() {
    this.gridId = 'location-configuration-grid';
  }

  getGrid() {
    return element(by.id(this.gridId));
  }

  getTitleRow(name) {
    return this.getGrid().$(`[data-title-row="${name}"]`);
  }

  getDataRow(name) {
    return this.getGrid().$(`[data-row="${name}"]`);
  }

  async openAddChild(name) {
    return this.getTitleRow(name)
      .$('[data-action="add-child"]')
      .click();
  }

  async openEdit(name) {
    const row = new GridRow(name);
    await row.dropdown().click();
    await row.edit().click();
  }

  /**
   * simulate the create Location Form button click to show the dialog of creation
   */
  async createLocationRoot(locationForm) {
    FU.buttons.create();

    await FU.input('ConfigLocationsModalCtrl.locations.name', locationForm.name);
    await FU.input('ConfigLocationsModalCtrl.locations.latitude', locationForm.latitude);
    await FU.input('ConfigLocationsModalCtrl.locations.longitude', locationForm.longitude);
    await components.locationTypeSelect.set(locationForm.type);

    FU.buttons.submit();
    await components.notification.hasSuccess();
  }

  async createLocationLevel01(locationForm) {
    FU.buttons.create();

    await FU.input('ConfigLocationsModalCtrl.locations.name', locationForm.name);
    await FU.input('ConfigLocationsModalCtrl.locations.latitude', locationForm.latitude);
    await FU.input('ConfigLocationsModalCtrl.locations.longitude', locationForm.longitude);
    await components.locationTypeSelect.set(locationForm.type);

    await components.yesNoRadios.set('no', 'is_highest');

    await components.locationConfigurationSelect.set(locationForm.parent);

    FU.buttons.submit();
    await components.notification.hasSuccess();
  }

  async createLocationLevel02(locationForm) {
    FU.buttons.create();

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
    FU.buttons.create();

    await FU.input('ConfigLocationsModalCtrl.locations.name', locationForm.name);
    await FU.input('ConfigLocationsModalCtrl.locations.latitude', locationForm.latitude);
    await FU.input('ConfigLocationsModalCtrl.locations.longitude', locationForm.longitude);
    await components.locationTypeSelect.set(locationForm.type);

    await components.yesNoRadios.set('no', 'is_highest');

    await components.locationConfigurationSelect.set(locationForm.parent);

    // Location Level 0
    const select01 = element(by.id('level_0'));
    await select01.click();
    const filterLocation01 = selectLocationLabel(locationForm.parent01);

    const option01 = select01.element(
      by.cssContainingText(
        '.dropdown-menu [role="option"]', filterLocation01,
      ),
    );
    await option01.click();

    // Location Level 1
    const select02 = element(by.id('level_1'));
    await select02.click();
    const filterLocation02 = selectLocationLabel(locationForm.parent02);

    const option02 = select02.element(
      by.cssContainingText(
        '.dropdown-menu [role="option"]', filterLocation02,
      ),
    );
    await option02.click();

    FU.buttons.submit();
    await components.notification.hasSuccess();
  }

  /**
   * simulate a click on the edit link of a function
   */
  async edit(updateLocationForm) {
    await FU.input('ConfigLocationsModalCtrl.locations.name', updateLocationForm.updateName);
    await components.locationTypeSelect.set(updateLocationForm.type);

    await components.yesNoRadios.set('no', 'is_highest');

    await components.locationConfigurationSelect.set(updateLocationForm.parent);

    // Location Level 0
    const select01 = element(by.id('level_0'));
    await select01.click();
    const filterLocation01 = selectLocationLabel(updateLocationForm.parent01);

    const option01 = select01.element(
      by.cssContainingText(
        '.dropdown-menu [role="option"]', filterLocation01,
      ),
    );
    await option01.click();

    FU.buttons.submit();
    await components.notification.hasSuccess();
  }

  async createLocationFromParent(locationForm) {
    await FU.input('ConfigLocationsModalCtrl.locations.name', locationForm.name);
    await components.locationTypeSelect.set(locationForm.type);

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

    FU.modal.submit();
    await components.notification.hasSuccess();
  }

  /**
   * simulate a click on the delete link of a function
   */
  async deleteError(label) {
    const row = new GridRow(label);
    await row.dropdown().click();
    await row.remove().click();

    FU.modal.submit();
    await components.notification.hasError();
  }

  async mergeLocations() {
    // Prevent mixing with no location selected
    await element(by.css(`[data-method="merge"]`)).click();
    await components.notification.hasWarn();

    // Prevent mixing with less than two location
    await GU.selectRow(this.gridId, 0);
    await element(by.css(`[data-method="merge"]`)).click();
    await components.notification.hasWarn();

    // Prevent mixing with more than two locations
    await GU.selectRow(this.gridId, 1);
    await GU.selectRow(this.gridId, 2);
    await element(by.css(`[data-method="merge"]`)).click();
    await components.notification.hasWarn();

    // Merging succes Township
    await GU.selectRow(this.gridId, 0);
    await GU.selectRow(this.gridId, 1);
    await GU.selectRow(this.gridId, 2);

    await GU.selectRow(this.gridId, 3);
    await GU.selectRow(this.gridId, 5);
    await element(by.css(`[data-method="merge"]`)).click();
    await element(by.css(`[data-reference="Merge Town 2"]`)).click();
    FU.buttons.submit();
    await components.notification.hasSuccess();

    // Merging succes Town
    await GU.selectRow(this.gridId, 2);
    await GU.selectRow(this.gridId, 3);
    await element(by.css(`[data-method="merge"]`)).click();
    await element(by.css(`[data-reference="Merge Town 1"]`)).click();

    FU.buttons.submit();
    await components.notification.hasSuccess();

    // Merging succes Town 2
    await GU.selectRow(this.gridId, 3);
    await GU.selectRow(this.gridId, 16);
    await element(by.css(`[data-method="merge"]`)).click();
    await element(by.css(`[data-reference="Gombe"]`)).click();

    FU.buttons.submit();
    await components.notification.hasSuccess();

    // Merging succes Country
    await GU.selectRow(this.gridId, 0);
    await GU.selectRow(this.gridId, 3);
    await element(by.css(`[data-method="merge"]`)).click();
    await element(by.css(`[data-reference="République Démocratique du Congo"]`)).click();

    FU.buttons.submit();
    await components.notification.hasSuccess();

    // Merging succes Province
    await GU.selectRow(this.gridId, 1);
    await GU.selectRow(this.gridId, 19);
    await element(by.css(`[data-method="merge"]`)).click();
    await element(by.css(`[data-reference="Bas-Uele"]`)).click();

    FU.buttons.submit();
    await components.notification.hasSuccess();

    // Merging succes Town
    await GU.selectRow(this.gridId, 8);
    await GU.selectRow(this.gridId, 20);
    await element(by.css(`[data-method="merge"]`)).click();
    await element(by.css(`[data-reference="Kananga"]`)).click();

    FU.buttons.submit();
    await components.notification.hasSuccess();
  }

}

module.exports = LocationFormManagementPage;
