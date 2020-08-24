/* eslint  */
/* global element, by, expect */

/**
 * This class is represents a depot page in term of structure and
 * behaviour so it is a depot page object.
 */
const FU = require('../shared/FormUtils');
const components = require('../shared/components');
const GridRow = require('../shared/GridRow');
const helpers = require('../shared/helpers');

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
  async createDepot(name, hasWarehouse, hasLocation, location) {
    await FU.buttons.create();
    await FU.input('DepotModalCtrl.depot.text', name);

    if (hasWarehouse) {
      await $('[name="is_warehouse"]').click();
    }

    if (hasLocation) {
      await $('[name="has_location"]').click();

      // select the locations specified
      await components.locationConfigurationSelect.set(location.location01);

      // Location Level 2
      const select02 = element(by.id('level_0'));
      await select02.click();
      const filterLocation02 = helpers.selectLocationLabel(location.location02);

      const option02 = select02.element(
        by.cssContainingText(
          '.dropdown-menu [role="option"]', filterLocation02,
        ),
      );
      await option02.click();
      // Location Level 3
      const select03 = element(by.id('level_1'));
      await select03.click();
      const filterLocation03 = helpers.selectLocationLabel(location.location03);

      const option03 = select03.element(
        by.cssContainingText(
          '.dropdown-menu [role="option"]', filterLocation03,
        ),
      );
      await option03.click();

      // Location Level 4
      const select04 = element(by.id('level_2'));
      await select04.click();
      const filterLocation04 = helpers.selectLocationLabel(location.location04);

      const option04 = select04.element(
        by.cssContainingText(
          '.dropdown-menu [role="option"]', filterLocation04,
        ),
      );
      await option04.click();

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
  async editDepot(text, newDepotText) {
    const row = new GridRow(text);
    await row.dropdown().click();
    await row.edit().click();

    await FU.input('DepotModalCtrl.depot.text', newDepotText);

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
   * join a location to a depot
   */
  async joinLocation(depotName, locations) {
    const row = new GridRow(depotName);
    await row.dropdown().click();
    await row.edit().click();

    const elm = $('[name="has_location"]');
    await elm.click();

    expect(await elm.isSelected()).to.equal(true);

    // select the locations specified
    await components.locationConfigurationSelect.set(locations.location01);

    // Location Level 2
    const select02 = element(by.id('level_0'));
    await select02.click();
    const filterLocation02 = helpers.selectLocationLabel(locations.location02);

    const option02 = select02.element(
      by.cssContainingText(
        '.dropdown-menu [role="option"]', filterLocation02,
      ),
    );
    await option02.click();
    // Location Level 3
    const select03 = element(by.id('level_1'));
    await select03.click();
    const filterLocation03 = helpers.selectLocationLabel(locations.location03);

    const option03 = select03.element(
      by.cssContainingText(
        '.dropdown-menu [role="option"]', filterLocation03,
      ),
    );
    await option03.click();

    // Location Level 4
    const select04 = element(by.id('level_2'));
    await select04.click();
    const filterLocation04 = helpers.selectLocationLabel(locations.location04);

    const option04 = select04.element(
      by.cssContainingText(
        '.dropdown-menu [role="option"]', filterLocation04,
      ),
    );
    await option04.click();

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
