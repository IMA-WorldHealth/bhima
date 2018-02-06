/* global element, by */

/**
 * This class is represents a Ipr Tax page in term of structure and
 * behaviour so it is a Ipr Tax page object
 */

const chai = require('chai');
const helpers = require('../shared/helpers');

helpers.configure(chai);

/* loading grid actions */
const GU = require('../shared/GridUtils');
const GA = require('../shared/GridAction');
const FU = require('../shared/FormUtils');
const components = require('../shared/components');

class IprTaxPage {
  constructor() {
    this.gridId = 'ipr-grid';
    this.iprTaxGrid = element(by.id(this.gridId));
    this.actionLinkColumn = 3;
  }

  /**
   * send back the number of iprTaxes in the grid
   */
  getIprTaxCount() {
    return this.iprTaxGrid
      .element(by.css('.ui-grid-render-container-body'))
      .all(by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index'))
      .count();
  }

  /**
   * simulate the create Ipr Scale button click to show the dialog of creation
   */
  createIprTax(iprTax) {
    FU.buttons.create();
    FU.input('IprTaxModalCtrl.iprTax.label', iprTax.label);
    FU.input('IprTaxModalCtrl.iprTax.description', iprTax.description);
    components.currencySelect.set(iprTax.currency_id);
    
    FU.buttons.submit();
    components.notification.hasSuccess();
  }

  /**
   * block creation without the function name
   */
  errorOnCreateIprTax() {
    FU.buttons.create();
    FU.buttons.submit();
    FU.validation.error('IprTaxModalCtrl.iprTax.label');
    FU.buttons.cancel();
  }

  /**
   * simulate a click on the edit link of a function
   */
  editIprTax(label, updateIprTax) {
    GU.getGridIndexesMatchingText(this.gridId, label)
      .then(indices => {
        const { rowIndex } = indices;
        GA.clickOnMethod(rowIndex, this.actionLinkColumn, 'edit', this.gridId);
        FU.input('IprTaxModalCtrl.iprTax.label', updateIprTax.label);
        FU.input('IprTaxModalCtrl.iprTax.description', updateIprTax.description);
        components.currencySelect.set(updateIprTax.currency_id);

        FU.buttons.submit();
        components.notification.hasSuccess();
      });
  }

  /**
   * simulate a click on the delete link of a function
   */
  deleteIprTax(label) {
    GU.getGridIndexesMatchingText(this.gridId, label)
      .then(indices => {
        const { rowIndex } = indices;
        GA.clickOnMethod(rowIndex, this.actionLinkColumn, 'delete', this.gridId);
        components.modalAction.confirm();
        components.notification.hasSuccess();
      });
  }
}

module.exports = IprTaxPage;