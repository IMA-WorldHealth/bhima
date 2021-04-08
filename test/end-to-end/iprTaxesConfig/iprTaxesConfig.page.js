/**
 * This class is represents a Ipr Tax page in term of structure and
 * behaviour so it is a Ipr Tax page object
 */

const GridRow = require('../shared/GridRow');
const FU = require('../shared/FormUtils');
const components = require('../shared/components');

class IprTaxConfigPage {
  /**
   * simulate the create Ipr Scale button click to show the dialog of creation
   */
  async createIprTaxConfig(iprTaxConfig) {
    await components.iprScale.set(iprTaxConfig.scale);

    await FU.buttons.create();
    await FU.input('IprTaxConfigModalCtrl.iprTax.rate', iprTaxConfig.rate);
    await components.currencyInput.set(iprTaxConfig.tranche_annuelle_debut, 'tranche_annuelle_debut');
    await components.currencyInput.set(iprTaxConfig.tranche_annuelle_fin, 'tranche_annuelle_fin');
    await FU.buttons.submit();
    await components.notification.hasSuccess();
  }

  /**
   * block creation without the function name
   */
  async errorOnCreateIprTaxConfig(scale) {
    await components.iprScale.set(scale);
    await FU.buttons.create();
    await FU.buttons.submit();
    await FU.validation.error('IprTaxConfigModalCtrl.iprTax.rate');
    await FU.buttons.cancel();
  }

  /**
   * simulate a click on the edit link of a function
   */
  async editIprTaxConfig(rate, updateIprTaxConfig) {
    await components.iprScale.set(updateIprTaxConfig.scale);

    const row = new GridRow(rate);
    await row.dropdown().click();
    await row.edit().click();

    await FU.input('IprTaxConfigModalCtrl.iprTax.rate', updateIprTaxConfig.rate);
    await components.currencyInput.set(updateIprTaxConfig.tranche_annuelle_debut, 'tranche_annuelle_debut');
    await components.currencyInput.set(updateIprTaxConfig.tranche_annuelle_fin, 'tranche_annuelle_fin');
    await FU.buttons.submit();
    await components.notification.hasSuccess();
  }

  /**
   * simulate a click on the delete link of a function
   */
  async deleteIprTaxConfig(label) {
    const row = new GridRow(label);
    await row.dropdown().click();
    await row.remove().click();

    await components.modalAction.confirm();
    await components.notification.hasSuccess();
  }
}

module.exports = IprTaxConfigPage;
