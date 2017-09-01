/* global element, by, browser */

/**
 * This class is represents a depot page in term of structure and
 * behaviour so it is a depot page object
 **/

const chai = require('chai');

const helpers = require('../shared/helpers');

helpers.configure(chai);

/** loading grid actions **/
const GA = require('../shared/GridAction');
const FU = require('../shared/FormUtils');
const components = require('../shared/components');

class DepotPage {

  constructor() {
    this.gridId = 'depot-grid';
    this.depotGrid = element(by.id(this.gridId));
    this.actionLinkColumn = 2;
  }

  /**
   * send back the number of depots in the grid
   */
  getDepotCount() {
    return this.depotGrid
      .element(by.css('.ui-grid-render-container-body'))
      .all(by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index'))
      .count();
  }

  /**
   * simulate the create depot button click to show the dialog of creation
   */
  createDepot(name, hasWarehouse) {
    FU.buttons.create();
    FU.input('DepotModalCtrl.depot.text', name);
    if (hasWarehouse) {
      element(by.css('[name="is_warehouse"]')).click();
    }
    FU.buttons.submit();
    components.notification.hasSuccess();
  }

  /**
   * block creation without the depot name
   */
  errorOnCreateDepot() {
    FU.buttons.create();
    FU.buttons.submit();
    FU.validation.error('DepotModalCtrl.depot.text');
    FU.buttons.cancel();
  }

  /**
   * simulate a click on the edit link of a depot
   */
  editDepot(n, name) {
    GA.clickOnMethod(n, this.actionLinkColumn, 'edit', this.gridId);
    FU.input('DepotModalCtrl.depot.text', name);
    FU.buttons.submit();
    components.notification.hasSuccess();
  }

  /**
   * simulate a click on the delete link of a depot
   */
  deleteDepot(n) {
    GA.clickOnMethod(n, this.actionLinkColumn, 'delete', this.gridId);
    components.modalAction.confirm();
    components.notification.hasSuccess();
  }

  /**
   * cancel deletion process
   */
  cancelDeleteDepot(n) {
    GA.clickOnMethod(n, this.actionLinkColumn, 'delete', this.gridId);
    components.modalAction.dismiss();
  }

  /**
   * forbid deletion of used depot
   */
  errorOnDeleteDepot(n) {
    GA.clickOnMethod(n, this.actionLinkColumn, 'delete', this.gridId);
    components.modalAction.confirm();
    components.notification.hasError();
  }
}

module.exports = DepotPage;
