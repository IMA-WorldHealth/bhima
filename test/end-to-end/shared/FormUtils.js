/* global browser, by, element */
'use strict';

const chai = require('chai');
const expect = chai.expect;
const helpers = require('./helpers');
helpers.configure(chai);

// These buttons depend on custom data tags to indicate actions.  This seems
// cleaner than using a whole bunch of ids which may potentially collide.
// However, this decision can be reviewed
const buttons =  {
  create: function create() { return $('[data-method="create"]').click(); },
  search: function search() { return $('[data-method="search"]').click(); },
  submit: function submit() { return $('[data-method="submit"]').click(); },
  cancel: function cancel() { return $('[data-method="cancel"]').click(); },
  clear: function clear() { return $('[data-method="clear"]').click(); },
  back: function back() { return $('[data-method="back"]').click(); },
  reset : function reset() { return $('[data-method="reset"]').click(); },
  delete: function delet() { return $('[data-method="delete"]').click(); }
};

// This methods are for easily working with modals.  Works with the same custom
// data tags used in form buttons.
const modal = {
  submit: function submit() { return $('[uib-modal-window] [data-method="submit"]').click(); },
  cancel: function cancel() { return $('[uib-modal-window] [data-method="cancel"]').click(); },
  close: function close() { return $('[uib-modal-window] [data-method="close"]').click(); },
  print: function print() { return $('[uib-modal-window] [data-method="print"]').click(); }
};

// convenience methods to see if the form contains feedback text.  Returns locators.
const feedback = {
  success: function success() { return by.css('[data-role="feedback"] > .text-success'); },
  error: function error() { return by.css('[data-role="feedback"] > .text-danger'); },
  warning: function warning() { return by.css('[data-role="feedback"] > .text-warning'); },
  info: function info() { return by.css('[data-role="feedback"] > .text-info'); }
};

// convenience methods to check form element validation states
const validation = {

  // an error state is present
  error : function error(model) {
    expect(
      element(by.model(model)).getAttribute('class'),
      `Expected ${model} to be invalid, but could not find the ng-invalid class.`
    ).to.eventually.contain('ng-invalid');
  },

  // no error state present
  ok : function success(model) {
    expect(
      element(by.model(model)).getAttribute('class'),
      `Expected ${model} to be valid, but could not find the ng-valid class.`
    ).to.eventually.contain('ng-valid');
  }
};

// expose routes to the view
module.exports = {

  // get an <input> element by its ng-model
  input : function input(model, value, anchor) {

    // get the HTML <input> element
    let input = anchor ?
      anchor.element(by.model(model)) :
      element(by.model(model));

    return input.clear().sendKeys(value);
  },

  /**
   * @method select
   *
   * @description
   * Selects an option from an <select> html element.  Accepts the model
   * selector, the option text, and an optional anchor element to search within.
   * If no anchor is provided, it defaults to the body.
   *
   * @param {String} model - the ng-model target to select
   * @param {String} option - the text of the <option> element to choose
   * @param {Element} anchor - a protractor element to search within
   * @returns {Element} - a protractor <option> element
   */
  select: function select(model, option, anchor) {
    anchor = anchor || $('body');
    let select = anchor.element(by.model(model));
    let choice = select.element(by.cssContainingText('option', option));
    return choice.click();
  },

  // get a radio button by its position and click
  radio: function radio(model, n) {
    return element.all(by.model(model)).get(n).click();
  },

  // asserts whether an element exists or not
  exists: function exists(locator, bool) {
    expect(
      element(locator).isPresent(),
      `Expected locator ${locator.toString()} to ${bool ? 'not ' : ' ' }exist.`
    ).to.eventually.equal(bool);
  },

  // asserts whether an element is visible on the page or not.
  visible: function visible(locator, bool) {
    expect(
      element(locator).isDisplayed(),
      `Expected locator ${locator.toString()} to ${bool ? 'not ' : ' ' }be visible.`
    ).to.eventually.equal(bool);
  },

  /**
   * @method typeahead
   *
   * @description
   * Selects a dropdown option from a typeahead html element.  Accepts the model
   * selector, the option text, and an optional anchor element to search within.
   * If no anchor is provided, it defaults to the body.
   *
   * @param {String} model - the ng-model target to select
   * @param {String} option - the text of the option element to choose
   * @param {Element} anchor - a protractor element to search within
   * @returns {Element} - a protractor option element
   */
  typeahead: function typeahead(model, label, anchor) {
    anchor = anchor || $('body');

    // type into the <input> element
    this.input(model, label, anchor);

    // select the item of the dropdown menu matching the label
    let option = anchor.element(by.cssContainingText('.dropdown-menu > [role="option"]', label));
    return option.click();
  },

  /**
   * @method uiSelect
   *
   * @description
   * Selects an option from the ui-select dropdown
   *
   * @param {String} model - the ng-model target to select
   * @param {String} option - the text of the option element to choose
   * @param {Element} anchor - a protractor element to search within
   * @returns {Element} - a protractor option element
   */
  uiSelect: function uiSelect(model, label, anchor) {
    anchor = anchor || $('body');

    // get the HTML <div> element that will trigger the select input
    let select = anchor ?
      anchor.element(by.model(model)) :
      element(by.model(model));

    // trigger the <input> rendering
    select.click();

    // type into the <input> element the searchable value
    this.input('$select.search', label, select);

    // select the item of the dropdown menu matching the label
    let option = select.element(by.cssContainingText('.dropdown-menu [role="option"]', label));
    return option.click();
  },

  /**
   * @method dropdown
   *
   * @description
   * Selects a dropdown option from a dropdown html element.  Accepts the target
   * selector, the option text, and an optional anchor element to search within.
   * If no anchor is provided, it defaults to the body.
   *
   * @param {String} selector - the css selector to select
   * @param {String} option - the text of the option element to choose
   * @param {Element} anchor - a protractor element to search within
   * @returns {Element} - a protractor option element
   */
  dropdown: function dropdown(selector, label, anchor) {
    anchor = anchor || $('body');

    // open the dropdown menu
    $(selector).click();

    let option = element(by.cssContainingText('[uib-dropdown-menu] > li', label));
    return option.click();
  },

  /**
   * @method hasText
   *
   * @description
   * Asserts that an element matching the locator contains the text passed
   * in as a parameter.
   *
   * @param {Object} locator - a protractor web-driver locator
   * @param {String} text - the text to search for within the element.
   */
  hasText: function hasText(locator, text) {
    expect(
      element(locator).getText(),
      `Expected locator ${locator.toString()} to contain "${text}".`
    ).to.eventually.equal(text);
  },

  // bind commonly used form buttons  These require specific data tags to be
  // leveraged effectively.
  buttons: buttons,

  // bind commonly shown feedback utilities
  // to detect feedback, the parent element must have the
  // [data-role="feedback"] attribute assigned to it.
  feedback: feedback,

  // bind validation states.  Each method takes in a model's string and asserts
  // the validation state.
  validation: validation,

  // bindings for modal overlay forms
  modal: modal
};
