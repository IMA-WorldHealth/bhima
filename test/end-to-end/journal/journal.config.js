const JournalCorePage = require('./journal.page.js');
const FU = require('../shared/FormUtils');

function JournalConfigurationModal() {

  const defaultVisibleColumnCount = 10;
  const page = new JournalCorePage();

  it(`displays ${defaultVisibleColumnCount} visible columns by default`, () => {
    // tests expect page to be in transaction mode
    $('[data-method="grouping"]').click();

    page.expectColumnCount(defaultVisibleColumnCount);
  });

  it('removes all but the debit and credit columns', () => {
    // remove grouping from the journal
    $('[data-method="grouping"]').click();

    page.openGridConfigurationModal();

    page.setColumnCheckboxes(['debit_equiv', 'credit_equiv']);

    FU.modal.submit();

    page.expectHeaderColumns(['Débit', 'Crédit']);
  });

  it('resets the columns to the defaults', () => {
    page.openGridConfigurationModal();

    page.setColumnCheckboxes(['debit_equiv', 'credit_equiv']);

    FU.modal.submit();

    page.expectHeaderColumns(['Débit', 'Crédit']);

    page.openGridConfigurationModal();

    page.setDefaultColumnCheckboxes();

    FU.modal.submit();

    page.expectColumnCount(defaultVisibleColumnCount);
  });

  it('correctly fetches full transactions together with `showFullTransactions` flag', () => {
    const PATIENT_REFERENCE = 'PA.TPA.2';
    const NUMBER_OF_REFERENCED_LINES = 4;
    const TOTAL_TRANSACTION_LINES_REFERENCED = 8;

    // limit to patient reference rows
    page.openGridSearchModal();
    FU.input('ModalCtrl.searchQueries.hrEntity', PATIENT_REFERENCE);
    FU.modal.submit();

    // check there are exclusively the rows referenced
    page.expectRowCount(NUMBER_OF_REFERENCED_LINES);

    // select `showAllTransactionRows`
    page.showFullTransactions(true);

    // check there are now full transactions shown for these rows
    page.expectRowCount(TOTAL_TRANSACTION_LINES_REFERENCED);
    page.resetSearchFilters();
  });
}

module.exports = JournalConfigurationModal;
