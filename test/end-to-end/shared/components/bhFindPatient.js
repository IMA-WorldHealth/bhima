/* global browser, element, by */

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
  mode : function mode(mode) {

    // get the dropdown
    var dropdown = element(by.css('[data-find-patient-dropdown-toggle]'));
    dropdown.click();

    // are we searching by id or name?
    var tmpl = (mode === 'id') ? 'ID' : 'NAME';

    // click the correct dropdown item
    var option = element(by.css(`[data-find-patient-option="FORM.LABELS.PATIENT_${tmpl}"]`));
    option.click();
  },

  /**
   * searches for a patient by name
   * @todo - this needs to be improved to select directly from the typeahead
   */
  findByName: function findByName(name) {

    var root = element(by.css(this.selector));

    // set the input to "find by name" mode
    this.mode('name');

    // get the input and enter the name provided
    FU.typeahead('$ctrl.nameInput', name);
  },

  /**
   * searches for a patient by id
   */
  findById : function findById(id) {

    // set the input to "find by name" mode
    this.mode('id');

    // get the input and enter the id provided
    FU.input('$ctrl.idInput', id);

    // submit the id to the server
    var submit = element(by.css('[data-find-patient-submit]'));
    submit.click();
  },

  reset : function reset() {
    $('[ng-click="$ctrl.reset()"]').click();
  }
};
