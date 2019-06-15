/* global element, by */

const FU = require('../FormUtils');

/**
 * hooks for the find patient component described in the component
 * bhFindPatient.js.
 * @public
 */
module.exports = {
  selector : '[data-find-patient]',

  /**
   * sets the input to the correct mode
   */
  mode : async function mode(_mode) {
    // get the dropdown
    const dropdown = element(by.css('[data-find-patient-dropdown-toggle]'));
    await dropdown.click();

    // are we searching by id or name?
    const tmpl = (_mode === 'id') ? 'ID' : 'NAME';

    // click the correct dropdown item
    const option = element(by.css(`[data-find-patient-option="FORM.LABELS.PATIENT_${tmpl}"]`));
    await option.click();
  },

  /**
   * searches for a patient by name
   * @todo - this needs to be improved to select directly from the typeahead
   */
  findByName : async function findByName(name) {
    // set the input to "find by name" mode
    await this.mode('name');

    // get the input and enter the name provided
    await FU.typeahead('$ctrl.nameInput', name);
  },

  /**
   * searches for a patient by id
   */
  findById : async function findById(id) {

    // set the input to "find by name" mode
    await this.mode('id');

    // get the input and enter the id provided
    await FU.input('$ctrl.idInput', id);

    // submit the id to the server
    const submit = element(by.css('[data-find-patient-submit]'));
    await submit.click();
  },

  reset : async function reset() {
    await $('[ng-click="$ctrl.reset()"]').click();
  },
};
