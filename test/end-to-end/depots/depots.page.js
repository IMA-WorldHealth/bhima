/* global element, by */

/**
 * This class is represents a depot page in term of structure and
 * behaviour so it is a depot page object
 */

const chai = require('chai');
const helpers = require('../shared/helpers');

const { expect } = chai;
helpers.configure(chai);

/* loading grid actions */
const GA = require('../shared/GridAction');
const GU = require('../shared/GridUtils');
const FU = require('../shared/FormUtils');
const components = require('../shared/components');

class DepotPage {
  constructor() {
    this.gridId = 'depot-grid';
    this.depotGrid = element(by.id(this.gridId));
    this.actionLinkColumn = 3;
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
   * @param {string} name the name of the depot
   * @param {boolean} hasWarehouse
   * @param {boolean} hasLocation if true it will enable the option of adding location
   * @param {array} location an array of location as [country_uuid, province_uuid, sector_uuid, village_uuid]
   */
  createDepot(name, hasWarehouse, hasLocation, location) {
    FU.buttons.create();
    FU.input('DepotModalCtrl.depot.text', name);
    if (hasWarehouse) {
      element(by.css('[name="is_warehouse"]')).click();
    }
    if (hasLocation) {
      element(by.css('[name="has_location"]')).click();
      components.locationSelect.set(location);
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
  editDepot(text, newDepotText) {
    GU.getGridIndexesMatchingText(this.gridId, text)
      .then(indices => {
        const { rowIndex } = indices;
        GA.clickOnMethod(rowIndex, this.actionLinkColumn, 'edit', this.gridId);
        FU.input('DepotModalCtrl.depot.text', newDepotText);

        // entry/exit permissions
        element(by.css('[name="allow_entry_purchase"]')).click();
        element(by.css('[name="allow_entry_integration"]')).click();
        element(by.css('[name="allow_entry_donation"]')).click();
        element(by.css('[name="allow_entry_transfer"]')).click();
        element(by.css('[name="allow_exit_debtor"]')).click();
        element(by.css('[name="allow_exit_service"]')).click();
        element(by.css('[name="allow_exit_transfer"]')).click();
        element(by.css('[name="allow_exit_loss"]')).click();


        FU.buttons.submit();
        components.notification.hasSuccess();
      });
  }

  /**
   * join a location to a depot
   */
  joinLocation(depotName, location) {
    GU.getGridIndexesMatchingText(this.gridId, depotName)
      .then(indices => {
        const { rowIndex } = indices;
        GA.clickOnMethod(rowIndex, this.actionLinkColumn, 'edit', this.gridId);

        element(by.css('[name="has_location"]')).click();
        return element(by.css('[name="has_location"]')).isSelected();
      })
      .then(selected => {
        expect(selected).to.be.equal(true);
        components.locationSelect.set(location);
        FU.buttons.submit();
        components.notification.hasSuccess();
      });
  }

  /**
   * remove a location to a depot
   */
  removeLocation(depotName) {
    GU.getGridIndexesMatchingText(this.gridId, depotName)
      .then(indices => {
        const { rowIndex } = indices;
        GA.clickOnMethod(rowIndex, this.actionLinkColumn, 'edit', this.gridId);

        element(by.model('DepotModalCtrl.hasLocation')).click();
        return element(by.model('DepotModalCtrl.hasLocation')).isSelected();
      })
      .then(selected => {
        expect(selected).to.be.equal(false);
        FU.buttons.submit();
        components.notification.hasSuccess();
      });
  }

  /**
   * simulate a click on the delete link of a depot
   */
  deleteDepot(text) {
    GU.getGridIndexesMatchingText(this.gridId, text)
      .then(indices => {
        const { rowIndex } = indices;
        GA.clickOnMethod(rowIndex, this.actionLinkColumn, 'delete', this.gridId);
        components.modalAction.confirm();
        components.notification.hasSuccess();
      });
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

  /**
  * select the User Depots
  */
  selectUserDepot(depots) {
    components.multipleDepotSelect.set(depots);    
  }

  /**
  * Submit button User Depot
  */
  submitUserDepot() {
    FU.buttons.submit();
    components.notification.hasSuccess();
  }

}

module.exports = DepotPage;
