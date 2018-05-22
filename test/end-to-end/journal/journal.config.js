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
}

module.exports = JournalConfigurationModal;
