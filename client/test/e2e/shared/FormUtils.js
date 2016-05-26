/* global browser, by, element, protractor */
'use strict';

const chai = require('chai');
const expect = chai.expect;
const helpers = require('./helpers');
helpers.configure(chai);

// These buttons depend on custom data tags to indicate actions.  This seems
// cleaner than using a whole bunch of ids which may potentially collide.
// However, this decision can be reviewed
var buttons =  {
  create: function create() { return $('[data-method="create"]').click(); },
  search: function search() { return $('[data-method="search"]').click(); },
  submit: function submit() { return $('[data-method="submit"]').click(); },
  cancel: function cancel() { return $('[data-method="cancel"]').click(); },
  back: function back() { return $('[data-method="back"]').click(); },
  delete: function delet() { return $('[data-method="delete"]').click(); }
};

// This methods are for easily working with modals.  Works with the same custom
// data tags used in form buttons.
var modal = {
  submit: function submit() { return $('[uib-modal-window] [data-method="submit"]').click(); },
  cancel: function cancel() { return $('[uib-modal-window] [data-method="cancel"]').click(); }
};

// convenience methods to see if the form contains feedback text.  Returns locators.
var feedback = {
  success: function success() { return by.css('[data-role="feedback"] > .text-success'); },
  error: function error() { return by.css('[data-role="feedback"] > .text-danger'); },
  warning: function warning() { return by.css('[data-role="feedback"] > .text-warning'); },
  info: function info() { return by.css('[data-role="feedback"] > .text-info'); }
};

// convenience methods to check form element validation states
var validation = {

  // an error state is present
  error : function error(model) {
    expect(element(by.model(model)).getAttribute('class')).to.eventually.contain('ng-invalid');
  },

  // no error state present
  ok : function success(model) {
    expect(element(by.model(model)).getAttribute('class')).to.eventually.contain('ng-valid');
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
    expect(element(locator).isPresent()).to.eventually.equal(bool);
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
