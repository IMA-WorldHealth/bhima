/* global element, by */

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
   * @param {String} id - a CSS id to select on.
   * @param {String} elementClick - determine a css class that will clicked to
   *   close the selection component Dates.
   */
  set : async function set(date, id, elementClick) {
    const elementCloseComponent = elementClick || '.header-image';

    // fail hard if the user did not pass into
    /* if (!(date instanceof Date)) {
      throw new TypeError('You  must provide a date object to the set() method.');
    } */

    // find the component in the DOM by its selector
    const root = element((id) ? by.id(id) : by.css(this.selector));

    // get the dropdown toggle and click it.
    const btn = root.element(by.css('[data-date-editor-dropdown-toggle]'));
    await btn.click();

    const input = root.element(by.css('[data-date-editor-input]'));
    await input.clear();

    // format the date appropriately.
    const year = date.getFullYear();

    const _month = String(date.getMonth() + 1);
    const month = (_month.length < 2) ? `0${_month}` : _month;

    const _day = String(date.getDate());
    const day = (_day.length < 2) ? `0${_day}` : _day;

    // set the date on the input
    await input.sendKeys([day, month, year].join('/'));

    // at this point, the datepicker is still open, and will intercept all
    // clicks that are made to any elements it is covering.  In order to make
    // the dropdown go away, we will click on the top-left bhima logo to blur
    // in default option, If not, the click will be on an element of the form,
    // if and only if the logo is not visible, for example for the modal window
    // the dropdown and remove it.
    await element(by.css(elementCloseComponent)).click();
  },
};
