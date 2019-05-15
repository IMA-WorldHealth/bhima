const JournalPage = require('./journal.page.js');
const ConfigModal = require('./ConfigurationModal.page');

function JournalConfigurationModal() {
  const defaultVisibleColumnCount = 9;
  const page = new JournalPage();

  it(`displays ${defaultVisibleColumnCount} visible columns by default`, async () => {
    // tests expect page to be in transaction mode
    await $('[data-method="grouping"]').click();

    await page.expectColumnCount(defaultVisibleColumnCount);
  });

  it('removes all but the debit and credit columns', async () => {
    // remove grouping from the journal
    await $('[data-method="grouping"]').click();

    await page.openGridConfigurationModal();
    const modal = new ConfigModal();
    await modal.setColumnCheckboxes(['debit_equiv', 'credit_equiv']);
    await modal.submit();

    await page.expectHeaderColumns(['Débit', 'Crédit']);
  });

  it('resets the columns to the defaults', async () => {
    await page.openGridConfigurationModal();

    const modal = new ConfigModal();
    await modal.setDefaultColumnCheckboxes();
    await modal.submit();

    await page.expectColumnCount(defaultVisibleColumnCount);
  });

  it('saves the column configuration in with uiGridSaveState');

  it('clears the column configuration in with uiGridSaveState');
}

module.exports = JournalConfigurationModal;
