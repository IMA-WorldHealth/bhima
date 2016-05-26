/* global browser, by, element, protractor */
'use strict';

const chai = require('chai');
const expect = chai.expect;
const helpers = require('./helpers');
helpers.configure(chai);

// Overide the element.all() prototype function provided by protractor to attach custom methods
// @TODO - is there a better way without overriding the prototype function?
var ElementArrayFinder = protractor.ElementArrayFinder;

/**
* Pick a random element from the ElementArrayFinder.
*
* @alias element.all(locator).random()
* @view
* <ul class="items">
*   <li>First</li>
*   <li>Second</li>
*   <li>Third</li>
* </ul>
*
* @example
* var list = element.all(by.css('.items li));
* expect(list.random().getText()).to.have.length.above(4);
*
* @todo - make this work. sigh.
ElementArrayFinder.prototype.random = function() {
  var self = this;
  return self.count()
  .then(function (length) {
    var n = Math.floor(Math.random() * length);
    return self.filter(function (elem, index) {
      return index === n;
    })
  });
};
*/

/**
* Filter out disabled elements from the ElementArrayFinder.
*
* @alias element.all(locator).enabled()
* @view
* <select>
*   <option disabled> I am disabled. </option>
*   <option> I am not not. </option>
* </select>
*
* @example
* var options = element.all(by.css('select > option'));
* expect(options.enabled()).to.have.length(1);
*/
ElementArrayFinder.prototype.enabled = function () {
  return this.filter(function (elem, index) {
    return elem.isEnabled();
  });
};

// These buttons depend on custom data tags to indicate actions.  This seems
// cleaner than using a whole bunch of ids which may potentially collide.
// However, this decision can be reviewed
var buttons =  {
  create : function create() { return $('[data-method="create"]').click(); },
  search : function search() { return $('[data-method="search"]').click(); },
  submit : function submit() { return $('[data-method="submit"]').click(); },
  cancel : function cancel() { return $('[data-method="cancel"]').click(); },
  back   : function back() { return $('[data-method="back"]').click(); },
  delete : function delet() { return $('[data-method="delete"]').click(); }
};

// This methods are for easily working with modals.  Works with the same custom
// data tags used in form buttons.
var modal = {
  submit : function submit() { return $('[uib-modal-window] [data-method="submit"]').click(); },
  cancel : function cancel() { return $('[uib-modal-window] [data-method="cancel"]').click(); }
};

// convenience methods to see if the form contains feedback text.  Returns locators.
var feedback = {
  success : function success() { return by.css('[data-role="feedback"] > .text-success'); },
  error : function error() { return by.css('[data-role="feedback"] > .text-danger'); },
  warning : function warning() { return by.css('[data-role="feedback"] > .text-warning'); },
  info : function info() { return by.css('[data-role="feedback"] > .text-info'); }
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
  input : function input(model, value) {
    return element(by.model(model)).clear().sendKeys(value);
  },

  // get a <select> element by its ng-model.
  select: function select(model, option) {
    var root = element(by.model(model));
    return root.element(by.cssContainingText('option', option)).click();
  },

  // get a radio button by its position and click
  radio : function radio(model, n) {
    return element.all(by.model(model)).get(n).click();
  },

  // asserts whether an element exists or not
  exists : function exists(locator, bool) {
    expect(element(locator).isPresent()).to.eventually.equal(bool);
  },

  // select the item in the typeahead that matches the value given
  // by label
  typeahead: function typeahead(model, label) {
    this.input(model, label);

    // select the item of the dropdown menu matching the label
    let option = element(by.cssContainingText('.dropdown-menu > [role="option"]', label));
    option.click();
  },

  // select an item from the dropdown menu identified by 'selector'
  dropdown: function dropdown(selector, label) {
    element(by.css(selector)).click();

    let option = element(by.cssContainingText('[uib-dropdown-menu] > li', label));
    option.click();
  },


  // bind commonly used form buttons  These require specific data tags to be
  // leveraged effectively.
  buttons: buttons,

  // bind commonly shown feedback utilities
  // to detect feedback, the parent element must have the
  // [data-role="feedback"] attribute assigned to it.
  feedback : feedback,

  // bind validation states.  Each method takes in a model's string and asserts
  // the validation state.
  validation : validation,

  // bindings for modal overlay forms
  modal : modal
};
