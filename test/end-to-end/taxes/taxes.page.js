/* global element, by */

/**
 * This class is represents a tax page in term of structure and
 * behaviour so it is a tax page object
 */

const chai = require('chai');
const helpers = require('../shared/helpers');

helpers.configure(chai);

/* loading grid actions */
const GA = require('../shared/GridAction');
const GU = require('../shared/GridUtils');
const FU = require('../shared/FormUtils');
const components = require('../shared/components');

class TaxPage {
  constructor() {
    this.gridId = 'tax-grid';
    this.taxGrid = element(by.id(this.gridId));
    this.actionLinkColumn = 8;
  }

  /**
   * send back the number of taxes in the grid
   */
  getTaxCount() {
    return this.taxGrid
      .element(by.css('.ui-grid-render-container-body'))
      .all(by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index'))
      .count();
  }

  /**
   * simulate the create tax button click to show the dialog of creation
   */
  createTax(tax) {
    FU.buttons.create();
    FU.input('TaxModalCtrl.tax.label', tax.label);
    FU.input('TaxModalCtrl.tax.abbr', tax.abbr);

    if (tax.is_employee) {
      element(by.css('[name="is_employee"]')).click();
    }

    if (tax.is_percent) {
      element(by.css('[name="is_percent"]')).click();
    }

    FU.input('TaxModalCtrl.tax.value', tax.value);

    components.accountSelect.set(tax.four_account_id, 'four_account_id');
    components.accountSelect.set(tax.six_account_id, 'six_account_id');

    if (tax.is_ipr) {
      element(by.css('[name="is_ipr"]')).click();
    }

    FU.buttons.submit();
    components.notification.hasSuccess();
  }

  /**
   * block creation without the function name
   */
  errorOnCreateTax() {
    FU.buttons.create();
    FU.buttons.submit();
    FU.validation.error('TaxModalCtrl.tax.label');
    FU.buttons.cancel();
  }

  /**
   * simulate a click on the edit link of a function
   */
  editTax(label, updateTax) {
    GU.getGridIndexesMatchingText(this.gridId, label)
      .then(indices => {
        const { rowIndex } = indices;
        GA.clickOnMethod(rowIndex, this.actionLinkColumn, 'edit', this.gridId);
        FU.input('TaxModalCtrl.tax.label', updateTax.label);

        FU.buttons.submit();
        components.notification.hasSuccess();
      });
  }

  /**
   * simulate a click on the delete link of a function
   */
  deleteTax(label) {
    GU.getGridIndexesMatchingText(this.gridId, label)
      .then(indices => {
        const { rowIndex } = indices;
        GA.clickOnMethod(rowIndex, this.actionLinkColumn, 'delete', this.gridId);
        components.modalAction.confirm();
        components.notification.hasSuccess();
      });
  }
}

module.exports = TaxPage;