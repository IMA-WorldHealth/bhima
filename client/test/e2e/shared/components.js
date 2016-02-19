/* global inject, browser, element, by, protractor */


/**
 * Hooks for the location select component described in the file
 * bhLocationSelect.js.
 *
 * A user is implicitly selecting a list of UUIDs, via the select dropdowns.
 * Therefore, it makes sense to pass in an array of UUIDs to the set() method
 * and expect an array to be returned from the get() method.
 *
 * @public
 */
exports.locationSelect = {
  selector : '[data-bh-location-select]',

  /** <select> element models to be used in selectors */
  models:     {
    country:  '$ctrl.country',
    province: '$ctrl.province',
    sector:   '$ctrl.sector',
    village:  '$ctrl.village',
  },

  /**
   * sets the component to the selected uuids for country, province,
   * sector, and village.
   *
   * @method set
   * @param {array} array - an array of uuids to select in this order: country,
   * province, sector, village
   * @param {string} id - an optional id of the <bh-location-select> component.
   * @returns null
   *
   * @example
   * var components = require('../shared/components');
   * var locations = [
   *   'dbe330b6-5cde-4830-8c30-dc00eccd1a5f', // Democratic Republic of the Congo
   *   'f6fc7469-7e58-45cb-b87c-f08af93edade', // Bas Congo,
   *   '0404e9ea-ebd6-4f20-b1f8-6dc9f9313450', // Tshikapa,
   *   '1f162a10-9f67-4788-9eff-c1fea42fcc9b' // kele
   * ];
   * components.locationSelect.set(locations)
   */
  set : function set(array, id) {

    /** if an id was passed in, use it as a target */
    var target = (id) ? element(by.id(id)) : element(by.css(this.selector));

    /** used to alias each <select>'s <option> elements later */
    var opts;

    /** <select> element selectors */
    var models = this.models;

    /** return selector for an option element */
    function getValue(uuid) {
      return by.css('option[value="?"]'.replace('?', uuid));
    }

    /** go through each select and click the associated uuid */

    /** country <select> */
    opts = target.element(by.model(models.country));
    opts.element(getValue(array[0])).click();

    /** province <select> */
    opts = target.element(by.model(models.province));
    opts.element(getValue(array[1])).click();

    /** sector <select> */
    opts = target.element(by.model(models.sector));
    opts.element(getValue(array[2])).click();

    /** village <select> */
    opts = target.element(by.model(models.village));
    opts.element(getValue(array[3])).click();
  },

  /**
   * return an array of country, province, sector, and village uuids to the
   * caller.  Takes in an option id if there are multiple location selects on
   * a singe page.
   *
   * @method get
   * @param {string} id - the id of the <bh-location-select> component
   * @returns {array} uuids - an array of uuids for the selected country,
   * province, sector, and village, respectively.
   *
   * @example
   * var components = require('../shared/components');
   *
   * // here we are using the id 'origin-location-select'
   * components.locationSelect('origin-location-select');
   */
  get : function get(id)  {

    /** if an id was passed in, use it as a target */
    var target = (id) ? element(by.id(id)) : element(by.css(this.selector));

    /** alias the models */
    var models = this.models;

    /** find each <select> by its model */
    var country = target.element(by.model(models.country)).$('option:checked');
    var province = target.element(by.model(models.province)).$('option:checked');
    var sector = target.element(by.model(models.sector)).$('option:checked');
    var village = target.element(by.model(models.village)).$('option:checked');

    /** return the selected values */
    return [
      country.getAttribute('value'),
      province.getAttribute('value'),
      sector.getAttribute('value'),
      village.getAttribute('value')
    ];
  }
};

/**
 * hooks for the currency input component described in the component
 * bhCurrencyInput.js.
 * @public
 */
exports.currencyInput = {
  selector : '[data-bh-currency-input]',

  /**
   * sets the value of the currency input.
   */
  set : function set(value) {
    var elm = element(by.css(this.selector));
    elm.sendKeys(value);
  },

  /**
   * get the value of the currency input.
   */
  get : function get() {
    var elm = element(by.css(this.selector));
    return elm.getAttribute('value');
  },

  /**
   * returns the presence of the ng-invalid tag
   */
  isInvalid: function () {
    var elm = element(by.css(this.selector));
    return elm.getAttribute('ng-invalid');
  }
};

/**
 * hooks for the find patient component described in the component
 * bhFindPatient.js.
 * @public
 */
exports.findPatient = {

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
    var option = element(by.css('[data-find-patient-option="FIND.PATIENT_?"]'.replace('?', tmpl)));
    option.click();
  },

  /**
   * searches for a patient by name
   * @todo - this needs to be improved to select directly from the typeahead
   */
  findByName: function findByName(name) {

    // set the input to "find by name" mode
    this.mode('name');

    // get the input and enter the id provided
    var input = element(by.model('$ctrl.idInput'));
    input.sendKeys(name);

    // submit the id to the server
    var submit = element(by.css('[data-find-patient-submit]'));
    submit.click();
  },

  /**
   * searches for a patient by id
   */
  findById : function findById(id) {

    // set the input to "find by name" mode
    this.mode('id');

    // get the input and enter the id provided
    var input = element(by.model('$ctrl.idInput'));
    input.sendKeys(id);

    // submit the id to the server
    var submit = element(by.css('[data-find-patient-submit]'));
    submit.click();
  }
};
