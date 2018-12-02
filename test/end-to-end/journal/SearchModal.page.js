/* global by */
/* eslint class-methods-use-this:off */
const SearchModal = require('../shared/search.page');
const bhAccountSelect = require('../shared/components/bhAccountSelect');
const bhYesNoRadios = require('../shared/components/bhYesNoRadios');
const FU = require('../shared/FormUtils');

class JournalSearchModal extends SearchModal {
  constructor() {
    super('journal-search');
  }

  showFullTransactions(bool) {
    this.switchToDefaultFilterTab();

    const selection = bool ? 'yes' : 'no';
    bhYesNoRadios.set(selection);

    this.switchToCustomFilterTab();
  }

  showPostedRecords(bool) {
    if (bool) {
      this.element
        .element(by.model('ModalCtrl.searchQueries.includeNonPosted')).click();
    }
  }

  setAccount(account) {
    bhAccountSelect.set(account);
  }

  setEntity(entity) {
    FU.input('ModalCtrl.searchQueries.hrEntity', entity, this.element);
  }

  setRecord(entity) {
    FU.input('ModalCtrl.searchQueries.hrRecord', entity, this.element);
  }

  setReference(entity) {
    FU.input('ModalCtrl.searchQueries.hrReference', entity, this.element);
  }
}

module.exports = JournalSearchModal;
