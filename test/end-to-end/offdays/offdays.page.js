/**
 * This class is represents a offday page in term of structure and
 * behaviour so it is a offday page object
 */

/* loading grid actions */
const FU = require('../shared/FormUtils');
const GridRow = require('../shared/GridRow');
const components = require('../shared/components');

class OffdayPage {

  /**
   * simulate the create offday button click to show the dialog of creation
   */
  async createOffday(offday) {
    await FU.buttons.create();
    await FU.input('OffdayModalCtrl.offday.label', offday.label);

    await components.dateEditor.set(offday.date, 'offday-date-editor', '.modal li.title');

    await FU.input('OffdayModalCtrl.offday.percent_pay', offday.percent_pay);

    await FU.buttons.submit();
    await components.notification.hasSuccess();
  }

  /**
   * block creation without the function name
   */
  async errorOnCreateOffday() {
    await FU.buttons.create();
    await FU.buttons.submit();
    await FU.validation.error('OffdayModalCtrl.offday.label');
    await FU.buttons.cancel();
  }

  async openDropdownMenu(label) {
    const row = new GridRow(label);
    await row.dropdown().click();
    return row;
  }

  /**
   * simulate a click on the edit link of a function
   */
  async editOffday(label, updateOffday) {
    const row = await this.openDropdownMenu(label);
    await row.edit().click();

    await FU.input('OffdayModalCtrl.offday.label', updateOffday.label);

    await components.dateEditor.set(updateOffday.date, 'offday-date-editor', '.modal li.title');

    await FU.input('OffdayModalCtrl.offday.percent_pay', updateOffday.percent_pay);

    await FU.buttons.submit();
    await components.notification.hasSuccess();
  }

  /**
   * simulate a click on the delete link of a function
   */
  async deleteOffday(label) {
    const row = await this.openDropdownMenu(label);
    await row.remove().click();

    await components.modalAction.confirm();
    await components.notification.hasSuccess();
  }
}

module.exports = OffdayPage;
