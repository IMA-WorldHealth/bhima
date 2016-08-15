/* global element, by, browser */

const chai = require('chai');
const expect = chai.expect;

const helpers = require('../shared/helpers');
helpers.configure(chai);

const FU = require('../shared/FormUtils');
const GU = require('../shared/GridUtils');

function JournalCorePage() {
  const page = this;
  const gridId = 'journal-grid';

  function openGridConfigurationModal() {
    return $('[data-method="configure"]').click();
  }

  // polyfill for array.includes on lower node versions
  const includes = (array, value) => array.indexOf(value) > -1;

  // toggle the column checkboxes to the following values
  // NOTE - these values come from the database column names, not the i18n text
  // names
  function setColumnCheckboxes(array) {
    const inputs = $('.modal-body').all(by.css('input[type="checkbox"]'));

    // deselect inputs that are selected and shouldn't be
    const deselects = inputs
      .filter(element => element.isSelected())
      .filter(element => {
        return element.getAttribute('data-column')
          .then(field => !includes(array, field));
      })
      .map(element => element.click());

    // select inputs that are not selected and should be
    const selects = inputs
      .filter(element => element.isSelected().then(bool => !bool))
      .filter(element => {
        return element.getAttribute('data-column')
          .then(field => includes(array, field));
      })
      .map(element => element.click());
  }

  // reset the default column selection
  function setDefaultColumnCheckboxes() {
    FU.buttons.reset();
  }

  // expose methods
  page.openGridConfigurationModal = openGridConfigurationModal;
  page.setColumnCheckboxes = setColumnCheckboxes;
  page.setDefaultColumnCheckboxes = setDefaultColumnCheckboxes;

  // custom wrappers for GU functionality
  page.expectColumnCount = (number) => GU.expectColumnCount(gridId, number);
  page.expectRowCount = (number) => GU.expectRowCount(gridId, number);
  page.expectHeaderColumns = (headerColumns) => GU.expectHeaderColumns(gridId, headerColumns);
}

module.exports = JournalCorePage;
