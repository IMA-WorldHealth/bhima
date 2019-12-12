/* global by */
/* eslint  */
const SearchModal = require('../shared/search.page');
const bhAccountSelect = require('../shared/components/bhAccountSelect');
const bhYesNoRadios = require('../shared/components/bhYesNoRadios');
const FU = require('../shared/FormUtils');

class JournalSearchModal extends SearchModal {
  constructor() {
    super('journal-search');
  }

  async showFullTransactions(bool) {
    await this.switchToDefaultFilterTab();

    const selection = bool ? 'yes' : 'no';
    await bhYesNoRadios.set(selection);

    await this.switchToCustomFilterTab();
  }

  async showPostedRecords(bool) {
    if (bool) {
      await this.element
        .element(by.model('ModalCtrl.searchQueries.includeNonPosted')).click();
    }
  }

  async setAccount(account) {
    await bhAccountSelect.set(account);
  }

  async setEntity(entity) {
    await FU.input('ModalCtrl.searchQueries.hrEntity', entity, this.element);
  }

  async setRecord(entity) {
    await FU.input('ModalCtrl.searchQueries.hrRecord', entity, this.element);
  }

  async setReference(entity) {
    await FU.input('ModalCtrl.searchQueries.hrReference', entity, this.element);
  }
}

module.exports = JournalSearchModal;
