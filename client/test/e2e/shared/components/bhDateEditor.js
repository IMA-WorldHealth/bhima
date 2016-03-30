/* global browser, element, by */

/**
* Date editor component interface for e2e test
* @public
*/
module.exports = {

  // root level css selector for this component
  selector : '[data-date-editor]',

  /**
   * Sets the date input's value to the passed in value
   *
   * @param {Date} date - a date object
   * @param {string} id - a CSS id to select on.
   */
  set: function set(date, id) {

    // fail hard if the user did not pass into
    if (!(date instanceof Date)) {
      throw new TypeError('You  must provide a date object to the set() method.');
    }

    // find the component in the DOM by its selector
    var root = element((id) ? by.id(id) : by.css(this.selector));

    // get the dropdown toggle and click it.
    var btn = root.element(by.css('[data-date-editor-dropdown-toggle]'));
    btn.click();

    var input = root.element(by.css('[data-date-editor-input]'));
    input.clear();

    // format the date appropriately.

    var year = date.getFullYear();

    var _month = String(date.getMonth() + 1) ;
    var month = (_month.length < 2) ? '0' + _month : _month;

    var _day = String(date.getDate()) ;
    var day = (_day.length < 2) ? '0' + _day : _day;

    // set the date on the input
    input.sendKeys([year, month, day].join('-'));

    // at this point, the datepicker is still open, and will intercept all
    // clicks that are made to any elements it is covering.  In order to make
    // the dropdown go away, we will click on the top-left bhima logo to blur
    // the dropdown and remove it.
    element(by.css('.header-image')).click();
  }
};
