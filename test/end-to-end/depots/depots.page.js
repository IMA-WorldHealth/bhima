/* eslint  */
/* global element, by, expect */

/**
 * This class is represents a depot page in term of structure and
 * behaviour so it is a depot page object.
 */
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
  async createDepot(name, hasWarehouse, hasLocation, location, defaultPurchaseInterval) {
    await FU.buttons.create();
    await FU.input('DepotModalCtrl.depot.text', name);
    await FU.input('DepotModalCtrl.depot.default_purchase_interval', defaultPurchaseInterval);


    if (hasWarehouse) {
      await $('[name="is_warehouse"]').click();
    }

    if (hasLocation) {
      await $('[name="has_location"]').click();
      await components.locationSelect.set(location);
    }

    await FU.buttons.submit();
    await components.notification.hasSuccess();
  }

  /**
   * simulate the create depot button click to show the dialog of creation
   * @param {string} item the name of the depot to create and parent {depot and parent}
   * @param {boolean} hasLocation if true it will enable the option of adding location
   * @param {array} location an array of location as [country_uuid, province_uuid, sector_uuid, village_uuid]
   */
  async createDepotByParent(item, hasLocation, location) {
    const row = new GridRow(item.parent);
    await row.dropdown().click();

    const findul = `ul.dropdown-menu-right.dropdown-menu[data-row-menu="${item.parent}"]`;
    await $(`${findul} a[data-method="add-dependant-depot"]`).click();

    await FU.input('DepotModalCtrl.depot.text', item.text);
    await FU.input('DepotModalCtrl.depot.default_purchase_interval', item.default_purchase_interval);

    if (hasLocation) {
      await $('[name="has_location"]').click();
      await components.locationSelect.set(location);
    }

    await FU.buttons.submit();
    await components.notification.hasSuccess();
  }

  /**
   * block creation without the depot name
   */
  async errorOnCreateDepot() {
    await FU.buttons.create();
    await FU.buttons.submit();
    await FU.validation.error('DepotModalCtrl.depot.text');
    await FU.buttons.cancel();
  }

  /**
   * simulate a click on the edit link of a depot
   */
  async editDepot(text, newDepotText, defaultPurchaseInterval) {
    const row = new GridRow(text);
    await row.dropdown().click();
    await row.edit().click();

    await FU.input('DepotModalCtrl.depot.text', newDepotText);
    await FU.input('DepotModalCtrl.depot.default_purchase_interval', defaultPurchaseInterval);

    // entry/exit permissions
    await $('[name="allow_entry_purchase"]').click();
    await $('[name="allow_entry_integration"]').click();
    await $('[name="allow_entry_donation"]').click();
    await $('[name="allow_entry_transfer"]').click();
    await $('[name="allow_exit_debtor"]').click();
    await $('[name="allow_exit_service"]').click();
    await $('[name="allow_exit_transfer"]').click();
    await $('[name="allow_exit_loss"]').click();

    await FU.modal.submit();
    await components.notification.hasSuccess();
  }

  /**
   * simulate a click on the edit link of a depot
   */
  async editDepotClearParent(text) {
    const row = new GridRow(text);
    await row.dropdown().click();
    await row.edit().click();

    const elm = $('[class="fa fa-eraser"]');
    await elm.click();

    await FU.modal.submit();
    await components.notification.hasSuccess();
  }

  /**
   * join a location to a depot
   */
  async joinLocation(depotName, locations) {
    const row = new GridRow(depotName);
    await row.dropdown().click();
    await row.edit().click();

    const elm = $('[name="has_location"]');
    await elm.click();

    expect(await elm.isSelected()).to.equal(true);

    await components.locationSelect.set(locations);

    await FU.buttons.submit();
    await components.notification.hasSuccess();
  }

  /**
   * join a location to a depot
   */
  async joinParent(item) {
    const row = new GridRow(item.depot);
    await row.dropdown().click();
    await row.edit().click();

    await components.depotSelect.set(item.parent);

    await FU.buttons.submit();
    await components.notification.hasSuccess();
  }

  /**
   * remove a location to a depot
   */
  async removeLocation(depotName) {
    const row = new GridRow(depotName);
    await row.dropdown().click();
    await row.edit().click();

    const elm = $('[name="has_location"]');
    await elm.click();
    expect(await elm.isSelected()).to.equal(false);

    await FU.buttons.submit();
    await components.notification.hasSuccess();
  }

  /**
   * simulate a click on the delete link of a depot
   */
  async deleteDepot(text) {
    const row = new GridRow(text);
    await row.dropdown().click();
    await row.remove().click();

    await components.modalAction.confirm();
    await components.notification.hasSuccess();
  }

  /**
   * select the User Depots
   */
  async selectUserDepot(depots) {
    await components.multipleDepotSelect.set(depots);
  }

  /**
   * Submit button User Depot
   */
  async submitUserDepot() {
    await components.notification.hasSuccess();
  }

  async selectDepot(name, id) {
    await components.bhMultipleDepotSearchSelect.set(name, id);
    await FU.buttons.submit();
  }
}

module.exports = DepotPage;
