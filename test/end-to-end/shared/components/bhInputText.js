/* global element, by */

/**
* Date editor component interface for e2e test
* @public
*/
const chai = require('chai');

const { expect } = chai;
module.exports = {

  // root level css selector for this component
  selector : '[input-text]',

  getInput : (id) => {
    const root = element((id) ? by.id(id) : by.css(this.selector));
    return root.element(by.css('[input-text-field]'));
  },

  /**
   * Sets the input's value by it id
   *
   * @param {Date} value - the text value
   * @param {String} id - a CSS id to select on.
   */
  set : function set(id, value) {
    const input = this.getInput(id);
    input.clear();
    input.sendKeys(value); // set the input value
  },

  validationError : function err(id) {
    expect(
      this.getInput(id).getAttribute('class'),
      `Expected ${id} to be invalid, but could not find the ng-invalid class.`
    ).to.eventually.contain('ng-invalid');
  },

  validationOk : function err(id) {
    expect(
      this.getInput(id).getAttribute('class'),
      `Expected ${id} to be invalid, but could not find the ng-invalid class.`
    ).to.eventually.contain('ng-valid');
  },
};
