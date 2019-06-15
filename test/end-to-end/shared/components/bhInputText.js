/* global element, by */

/**
* Date editor component interface for e2e test
* @public
*/
const { expect } = require('chai');

module.exports = {

  // root level css selector for this component
  selector : '[input-text]',

  getInput : (id) => {
    const root = element((id) ? by.id(id) : by.css(this.selector));
    return id ? root : root.element(by.css('[input-text-field]'));
  },

  /**
   * Sets the input's value by it id
   *
   * @param {Date} value - the text value
   * @param {String} id - a CSS id to select on.
   */
  set : async function set(id, value) {
    const input = this.getInput(id);
    await input.clear();
    await input.sendKeys(value); // set the input value
  },

  validationError : async function err(id) {
    expect(
      await this.getInput(id).getAttribute('class'),
      `Expected ${id} to be invalid, but could not find the ng-invalid class.`
    ).to.contain('ng-invalid');
  },

  validationOk : async function err(id) {
    expect(
      await this.getInput(id).getAttribute('class'),
      `Expected ${id} to be invalid, but could not find the ng-invalid class.`
    ).to.contain('ng-valid');
  },
};
