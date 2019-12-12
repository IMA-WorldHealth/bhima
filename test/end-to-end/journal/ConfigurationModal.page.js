/* global by */
const FU = require('../shared/FormUtils');

class JournalConfigurationModal {
  constructor() {
    this.modal = $('[uib-modal-window]');

    this.buttons = {
      reset : FU.buttons.reset,
      submit : FU.modal.submit,
    };
  }

  // toggle the column checkboxes to the following values
  // NOTE - these values come from the database column names, not the i18n text
  // name
  async setColumnCheckboxes(array) {
    const inputs = this.modal.$('.modal-body').all(by.css('input[type="checkbox"]'));

    // deselect inputs that are selected and shouldn't be
    const clear = inputs
      .filter(element => element.isSelected())
      .filter(element => element.getAttribute('data-column')
        .then(field => !array.includes(field)))
      .map(element => element.click());

    // select inputs that are not selected and should be
    const unclear = inputs
      .filter(element => element.isSelected().then(bool => !bool))
      .filter(element => element.getAttribute('data-column')
        .then(field => array.includes(field)))
      .map(element => element.click());

    // trick protractor into treating this as a promise
    return Promise.all([clear, unclear]);
  }

  // reset the default column selection
  setDefaultColumnCheckboxes() {
    return this.buttons.reset();
  }

  submit() {
    return this.buttons.submit();
  }
}
module.exports = JournalConfigurationModal;
