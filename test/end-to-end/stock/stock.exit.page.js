/* global element, by, browser */

const FU = require('../shared/FormUtils');
const GU = require('../shared/GridUtils');
const helpers = require('../shared/helpers');
const components = require('../shared/components');

function StockExitPage() {
  const page = this;

  const gridId = 'stock-exit-grid';

  // the grid id
  page.gridId = gridId;

  /**
   * @method setDepot
   * @param {string} label - the depot label
   */
  page.setDepot = function setDepot(label) {
    components.depotDropdown.set(label);
  };

  /**
   * @method setPatient
   * @param {string} reference - the patient reference
   */
  page.setPatient = function setDepot(reference) {
    element(by.css('[name="btn-patient"]')).click();
    components.findPatient.findById(reference);
    FU.modal.submit();
  };

  /**
   * @method setDescription
   * @param {string} descrition - the exit description
   */
  page.setDescription = function setDescription(description) {
    FU.input('StockCtrl.movement.description', description);
  };

  /**
   * @method setDate
   * @param {string} date - the exit date
   */
  page.setDate = function setDate(date) {
    components.dateEditor.set(date);
  };

  /**
   * @method addRows
   */
  page.addRows = function addRows(n) {
    FU.input('StockCtrl.itemIncrement', n);
    element(by.css('[id="btn-add-rows"]')).click();
  };
}

module.exports = StockExitPage;
