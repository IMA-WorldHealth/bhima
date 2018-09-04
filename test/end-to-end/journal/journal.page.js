/* global by */

const FU = require('../shared/FormUtils');
const GU = require('../shared/GridUtils');
const Filters = require('../shared/components/bhFilters');

function JournalCorePage() {
  const page = this;
  const gridId = 'journal-grid';

  // polyfill for array.includes on lower node versions
  const includes = (array, value) => array.indexOf(value) > -1;

  function openGridConfigurationModal() {
    $('[data-action="open-tools"]').click();
    return $('[data-method="configure"]').click();
  }

  function openGridSearchModal() {
    return $('[data-method="search"').click();
  }

  // toggle the column checkboxes to the following values
  // NOTE - these values come from the database column names, not the i18n text
  // name
  function setColumnCheckboxes(array) {
    const inputs = $('.modal-body').all(by.css('input[type="checkbox"]'));

    // deselect inputs that are selected and shouldn't be
    const clear = inputs
      .filter(element => element.isSelected())
      .filter(element => element.getAttribute('data-column')
        .then(field => !includes(array, field)))
      .map(element => element.click());

    // select inputs that are not selected and should be
    const unclear = inputs
      .filter(element => element.isSelected().then(bool => !bool))
      .filter(element => element.getAttribute('data-column')
        .then(field => includes(array, field)))
      .map(element => element.click());

    // trick protractor into treating this as a promise
    return Promise.all([clear, unclear]);
  }

  // reset the default column selection
  function setDefaultColumnCheckboxes() {
    FU.buttons.reset();
  }

  function checkRow(n) {
    GU.selectRow(gridId, n);
  }

  function openTrialBalanceModal() {
    $('[data-action="open-tools"]').click();
    return $('[data-method="trial"]').click();
  }

  function resetSearchFilters() {
    const filters = new Filters();

    // reset custom filters
    filters.resetFilters();

    // reset default filter negative value
    showFullTransactions(false);
  }

  // @TODO(sfount) A significantly better selector should be used here but
  //               the model on the component is `$ctrl.value`. Something
  //               less ambiguos should be used.
  function showFullTransactions(value) {
    const selection = value ? 'yes' : 'no';

    openGridSearchModal();
    $('[data-default-filter-tab]').click();
    $(`[data-choice="${selection}"]`).click();
    FU.modal.submit();
  }

  // expose methods
  page.openGridConfigurationModal = openGridConfigurationModal;
  page.openGridSearchModal = openGridSearchModal;
  page.setColumnCheckboxes = setColumnCheckboxes;
  page.setDefaultColumnCheckboxes = setDefaultColumnCheckboxes;
  page.checkRow = checkRow;
  page.openTrialBalanceModal = openTrialBalanceModal;
  page.resetSearchFilters = resetSearchFilters;
  page.showFullTransactions = showFullTransactions;

  // custom wrappers for GU functionality
  page.expectColumnCount = (number) => GU.expectColumnCount(gridId, number);
  page.expectRowCount = (number) => GU.expectRowCount(gridId, number);
  page.expectRowCountAbove = (number) => GU.expectRowCountAbove(gridId, number);
  page.expectHeaderColumns = (headerColumns) => GU.expectHeaderColumns(gridId, headerColumns);
}

module.exports = JournalCorePage;
