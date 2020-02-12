/* global element, by */
/* eslint  */

/**
 * This class is represents a Data Collector page in term of structure and
 * behaviour so it is a Data Collector Management page object
 */

/* loading grid actions */
const GridRow = require('../shared/GridRow');
const FU = require('../shared/FormUtils');
const components = require('../shared/components');

class DataCollectorManagementPage {
  constructor() {
    this.gridId = 'data-collector-management-grid';
    this.rubricGrid = element(by.id(this.gridId));
    this.actionLinkColumn = 5;
  }

  /**
   * simulate the create Data Collector button click to show the dialog of creation
   */
  async create(dataCollectorManagement) {
    await FU.buttons.create();
    await FU.input('DataCollectorManagementModalCtrl.dataCollector.label', dataCollectorManagement.label);
    await FU.input('DataCollectorManagementModalCtrl.dataCollector.description',
      dataCollectorManagement.description, this.modal);
    await FU.input('DataCollectorManagementModalCtrl.dataCollector.version_number',
      dataCollectorManagement.version_number, this.modal);
    await FU.uiSelect('DataCollectorManagementModalCtrl.dataCollector.color', dataCollectorManagement.color);
    await element(by.id('is_related_patient')).click();
    await FU.buttons.submit();
    await components.notification.hasSuccess();
  }

  /**
   * block creation without the function name
   */
  async errorOnCreate() {
    await FU.buttons.create();
    await FU.buttons.submit();
    await FU.validation.error('DataCollectorManagementModalCtrl.dataCollector.label');
    await FU.buttons.cancel();
  }

  /**
   * simulate a click on the edit link of a function
   */
  async edit(label, updateDataCollector) {
    const row = new GridRow(label);
    await row.dropdown().click();
    await row.edit().click();

    await FU.input('DataCollectorManagementModalCtrl.dataCollector.label', updateDataCollector.label);
    await FU.input('DataCollectorManagementModalCtrl.dataCollector.version_number', updateDataCollector.version_number);
    await FU.uiSelect('DataCollectorManagementModalCtrl.dataCollector.color', updateDataCollector.color);

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

module.exports = DataCollectorManagementPage;
