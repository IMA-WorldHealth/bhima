const JournalPage = require('./journal.page.js');
const ConfigModal = require('./ConfigurationModal.page');

function JournalConfigurationModal() {
  const defaultVisibleColumnCount = 9;
  const page = new JournalPage();

  it(`displays ${defaultVisibleColumnCount} visible columns by default`, () => {
    // tests expect page to be in transaction mode
    $('[data-method="grouping"]').click();

    page.expectColumnCount(defaultVisibleColumnCount);
  });

  it('removes all but the debit and credit columns', () => {
    // remove grouping from the journal
    $('[data-method="grouping"]').click();

    page.openGridConfigurationModal();
    const modal = new ConfigModal();
    modal.setColumnCheckboxes(['debit_equiv', 'credit_equiv']);
    modal.submit();

    page.expectHeaderColumns(['Débit', 'Crédit']);
  });

  it('resets the columns to the defaults', () => {
    page.openGridConfigurationModal();

    const modal = new ConfigModal();
    modal.setDefaultColumnCheckboxes();
    modal.submit();

    page.expectColumnCount(defaultVisibleColumnCount);
  });

  it('saves the column configuration in with uiGridSaveState');

  it('clears the column configuration in with uiGridSaveState');
}

module.exports = JournalConfigurationModal;
