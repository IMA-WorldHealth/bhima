/* global element, by */
/* eslint  */

/**
 * This class is represents Locations types page in term of structure and
 * behaviour so it is a Location Form Management page object
 */

/* loading grid actions */
const GridRow = require('../shared/GridRow');
const FU = require('../shared/FormUtils');
const components = require('../shared/components');

class LocationTypeFormManagement {
  constructor() {
    this.gridId = 'type-grid';
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

  async openEdit(name) {
    const row = new GridRow(name);
    await row.dropdown().click();
    await row.edit().click();
  }

  /**
   * simulate the create Location Type Form button click to show the dialog of creation
   */
  async createType(TypeForm) {
    FU.buttons.create();

    await FU.input('ModalCtrl.type.typeLabel', TypeForm.typeLabel);
    await FU.input('ModalCtrl.type.label_name', TypeForm.label_name);
    await components.colorSelect.set(TypeForm.color);

    await element(by.id('is_leaves')).click();

    FU.buttons.submit();
    await components.notification.hasSuccess();
  }

  /**
   * simulate a click on the edit link of a function
   */
  async edit(updateLocationForm) {
    await FU.input('ModalCtrl.type.typeLabel', updateLocationForm.typeLabel);
    await FU.input('ModalCtrl.type.label_name', updateLocationForm.label_name);
    await components.colorSelect.set(updateLocationForm.color);

    FU.buttons.submit();
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

  /**
   * simulate a click on the delete link of a function
   */
  async deleteError(label) {
    const row = new GridRow(label);
    await row.dropdown().click();
    await row.remove().click();

    await FU.modal.submit();
    await components.notification.hasError();
  }

}

module.exports = LocationTypeFormManagement;
