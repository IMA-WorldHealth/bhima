/* global element, by */
/* eslint  */

/**
 * This class is represents a Choise List Management page in term of structure and
 * behaviour so it is a Choise List Management page object
 */

/* loading grid actions */
const GridRow = require('../shared/GridRow');
const FU = require('../shared/FormUtils');
const components = require('../shared/components');

class ChoiseListManagementPage {
  constructor() {
    this.gridId = 'choises-list-management-grid';
    this.rubricGrid = element(by.id(this.gridId));
    this.actionLinkColumn = 5;
  }

  /**
   * simulate the create PayrollConfig button click to show the dialog of creation
   */
  async create(ChoiseListElement) {
    await FU.buttons.create();
    await FU.input('ChoisesListManagementModalCtrl.choise.label', ChoiseListElement.label);
    await FU.input('ChoisesListManagementModalCtrl.choise.name', ChoiseListElement.name);
    await element(by.id('is_title')).click();
    await element(by.id('is_group')).click();


    await FU.buttons.submit();
    await components.notification.hasSuccess();
  }

  /**
   * block creation without the function name
   */
  async errorOnCreate() {
    await FU.buttons.create();
    await FU.buttons.submit();
    await FU.validation.error('ChoisesListManagementModalCtrl.choise.label');
    await FU.buttons.cancel();
  }

  /**
   * simulate a click on the edit link of a function
   */
  async edit(label, updateDataCollector) {
    const row = new GridRow(label);
    row.dropdown().click();
    row.edit().click();

    await components.choiseListSelect.set(updateDataCollector.parent, 'parent');
    await components.choiseListSelect.set(updateDataCollector.group_label, 'group_label');

    await element(by.id('is_title')).click();
    await element(by.id('is_group')).click();

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

module.exports = ChoiseListManagementPage;
