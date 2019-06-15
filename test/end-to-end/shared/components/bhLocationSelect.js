/* global element, by */

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
module.exports = {
  selector : '[data-bh-location-select]',

  /** <select> element models to be used in selectors */
  models :     {
    country :  '$ctrl.country',
    province : '$ctrl.province',
    sector :   '$ctrl.sector',
    village :  '$ctrl.village',
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
  set : async function set(array, id) {

    /** if an id was passed in, use it as a target */
    const target = (id) ? element(by.id(id)) : element(by.css(this.selector));

    /** used to alias each <select>'s <option> elements later */
    let opts;

    /** <select> element selectors */
    const { models } = this;

    /** return selector for an option element */
    function getValue(uuid) {
      return by.css(`option[value="${uuid}"]`);
    }

    /** go through each select and click the associated uuid */

    /** country <select> */
    opts = target.element(by.model(models.country));
    await opts.element(getValue(array[0])).click();

    /** province <select> */
    opts = target.element(by.model(models.province));
    await opts.element(getValue(array[1])).click();

    /** sector <select> */
    opts = target.element(by.model(models.sector));
    await opts.element(getValue(array[2])).click();

    /** village <select> */
    opts = target.element(by.model(models.village));
    await opts.element(getValue(array[3])).click();
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
  get : async function get(id) {

    /** if an id was passed in, use it as a target */
    const target = (id) ? element(by.id(id)) : element(by.css(this.selector));

    /** alias the models */
    const { models } = this;

    /** find each <select> by its model */
    const country = target.element(by.model(models.country)).$('option:checked');
    const province = target.element(by.model(models.province)).$('option:checked');
    const sector = target.element(by.model(models.sector)).$('option:checked');
    const village = target.element(by.model(models.village)).$('option:checked');

    /** return the selected values */
    return Promise.all([
      country.getAttribute('value'),
      province.getAttribute('value'),
      sector.getAttribute('value'),
      village.getAttribute('value'),
    ]);
  },
};
