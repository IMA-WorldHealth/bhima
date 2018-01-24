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

class IprTaxConfigPage {
  constructor() {
    this.gridId = 'iprconfig-grid';
    this.iprTaxGrid = element(by.id(this.gridId));
    this.actionLinkColumn = 11;
  }

  /**
   * send back the number of iprTaxesConfig in the grid
   */
  getIprTaxConfigCount() {
    return this.iprTaxGrid
      .element(by.css('.ui-grid-render-container-body'))
      .all(by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index'))
      .count();
  }

  /**
   * simulate the create Ipr Scale button click to show the dialog of creation
   */
  createIprTaxConfig(iprTaxConfig) {
    components.iprScale.set(iprTaxConfig.scale);

    FU.buttons.create();
    FU.input('IprTaxConfigModalCtrl.iprTax.rate', iprTaxConfig.rate);
    FU.input('IprTaxConfigModalCtrl.iprTax.tranche_annuelle_debut', iprTaxConfig.tranche_annuelle_debut);
    FU.input('IprTaxConfigModalCtrl.iprTax.tranche_annuelle_fin', iprTaxConfig.tranche_annuelle_fin);

    FU.buttons.submit();
    components.notification.hasSuccess();
  }

  /**
   * block creation without the function name
   */
  errorOnCreateIprTaxConfig(scale) {
    components.iprScale.set(scale);
    FU.buttons.create();
    FU.buttons.submit();
    FU.validation.error('IprTaxConfigModalCtrl.iprTax.rate');
    FU.buttons.cancel();
  }

  /**
   * simulate a click on the edit link of a function
   */
  editIprTaxConfig(rate, updateIprTaxConfig) {
    components.iprScale.set(updateIprTaxConfig.scale);

    GU.getGridIndexesMatchingText(this.gridId, rate)
      .then(indices => {
        const { rowIndex } = indices;
        GA.clickOnMethod(rowIndex, this.actionLinkColumn, 'edit', this.gridId);

        FU.input('IprTaxConfigModalCtrl.iprTax.rate', updateIprTaxConfig.rate);
        FU.input('IprTaxConfigModalCtrl.iprTax.tranche_annuelle_debut', updateIprTaxConfig.tranche_annuelle_debut);
        FU.input('IprTaxConfigModalCtrl.iprTax.tranche_annuelle_fin', updateIprTaxConfig.tranche_annuelle_fin);

        FU.buttons.submit();
        components.notification.hasSuccess();
      });
  }

  /**
   * simulate a click on the delete link of a function
   */
  deleteIprTaxConfig(label) {
    GU.getGridIndexesMatchingText(this.gridId, label)
      .then(indices => {
        const { rowIndex } = indices;
        GA.clickOnMethod(rowIndex, this.actionLinkColumn, 'delete', this.gridId);
        components.modalAction.confirm();
        components.notification.hasSuccess();
      });
  }
}

module.exports = IprTaxConfigPage;
