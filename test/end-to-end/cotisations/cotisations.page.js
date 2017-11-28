/* global element, by */

/**
 * This class is represents a cotisation page in term of structure and
 * behaviour so it is a cotisation page object
 */

const chai = require('chai');
const helpers = require('../shared/helpers');

helpers.configure(chai);

/* loading grid actions */
const GA = require('../shared/GridAction');
const GU = require('../shared/GridUtils');
const FU = require('../shared/FormUtils');
const components = require('../shared/components');

class CotisationPage {
  constructor() {
    this.gridId = 'cotisation-grid';
    this.cotisationGrid = element(by.id(this.gridId));
    this.actionLinkColumn = 7;
  }

  /**
   * send back the number of cotisations in the grid
   */
  getCotisationCount() {
    return this.cotisationGrid
      .element(by.css('.ui-grid-render-container-body'))
      .all(by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index'))
      .count();
  }

  /**
   * simulate the create cotisation button click to show the dialog of creation
   */
  createCotisation(cotisation) {
    FU.buttons.create();
    FU.input('CotisationModalCtrl.cotisation.label', cotisation.label);
    FU.input('CotisationModalCtrl.cotisation.abbr', cotisation.abbr);

    if (cotisation.is_employee) {
      element(by.css('[name="is_employee"]')).click();
    }

    if (cotisation.is_percent) {
      element(by.css('[name="is_percent"]')).click();
    }

    FU.input('CotisationModalCtrl.cotisation.value', cotisation.value);

    components.accountSelect.set(cotisation.four_account_id, 'four_account_id');
    components.accountSelect.set(cotisation.six_account_id, 'six_account_id');

    FU.buttons.submit();
    components.notification.hasSuccess();
  }

  /**
   * block creation without the function name
   */
  errorOnCreateCotisation() {
    FU.buttons.create();
    FU.buttons.submit();
    FU.validation.error('CotisationModalCtrl.cotisation.label');
    FU.buttons.cancel();
  }

  /**
   * simulate a click on the edit link of a function
   */
  editCotisation(label, updateCotisation) {
    GU.getGridIndexesMatchingText(this.gridId, label)
      .then(indices => {
        const { rowIndex } = indices;
        GA.clickOnMethod(rowIndex, this.actionLinkColumn, 'edit', this.gridId);
        FU.input('CotisationModalCtrl.cotisation.label', updateCotisation.label);

        FU.buttons.submit();
        components.notification.hasSuccess();
      });
  }

  /**
   * simulate a click on the delete link of a function
   */
  deleteCotisation(label) {
    GU.getGridIndexesMatchingText(this.gridId, label)
      .then(indices => {
        const { rowIndex } = indices;
        GA.clickOnMethod(rowIndex, this.actionLinkColumn, 'delete', this.gridId);
        components.modalAction.confirm();
        components.notification.hasSuccess();
      });
  }
}

module.exports = CotisationPage;