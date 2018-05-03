/* eslint class-methods-use-this:"off" */
/* global element, by */

/**
 * This class is represents a depot page in term of structure and
 * behaviour so it is a depot page object.
 */
const chai = require('chai');
const helpers = require('../shared/helpers');

const { expect } = chai;
helpers.configure(chai);

/* loading grid actions */
const FU = require('../shared/FormUtils');
const components = require('../shared/components');

const GridRow = require('../shared/GridRow');

class DepotPage {
  constructor() {
    this.gridId = 'depot-grid';
    this.depotGrid = element(by.id(this.gridId));
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
      $('[name="is_warehouse"]').click();
    }
    if (hasLocation) {
      $('[name="has_location"]').click();
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
    const row = new GridRow(text);
    row.dropdown().click();
    row.edit().click();

    FU.input('DepotModalCtrl.depot.text', newDepotText);

    // entry/exit permissions
    $('[name="allow_entry_purchase"]').click();
    $('[name="allow_entry_integration"]').click();
    $('[name="allow_entry_donation"]').click();
    $('[name="allow_entry_transfer"]').click();
    $('[name="allow_exit_debtor"]').click();
    $('[name="allow_exit_service"]').click();
    $('[name="allow_exit_transfer"]').click();
    $('[name="allow_exit_loss"]').click();

    FU.modal.submit();
    components.notification.hasSuccess();
  }

  /**
   * join a location to a depot
   */
  joinLocation(depotName, locations) {
    const row = new GridRow(depotName);
    row.dropdown().click();
    row.edit().click();

    const elm = $('[name="has_location"]');
    elm.click();

    expect(elm.isSelected()).to.eventually.equal(true);

    components.locationSelect.set(locations);

    FU.buttons.submit();
    components.notification.hasSuccess();
  }

  /**
   * remove a location to a depot
   */
  removeLocation(depotName) {
    const row = new GridRow(depotName);
    row.dropdown().click();
    row.edit().click();

    const elm = $('[name="has_location"]');
    elm.click();
    expect(elm.isSelected()).to.eventually.equal(false);

    FU.buttons.submit();
    components.notification.hasSuccess();
  }

  /**
   * simulate a click on the delete link of a depot
   */
  deleteDepot(text) {
    const row = new GridRow(text);
    row.dropdown().click();
    row.remove().click();

    components.modalAction.confirm();
    components.notification.hasSuccess();
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
