/* global browser, by, element, protractor */

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
var expect = chai.expect;

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
  submit : function submit() { return $('[data-method="submit"]').click(); },
  cancel : function cancel() { return $('[data-method="cancel"]').click(); },
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
    expect(element(by.model(model)).getAttribute('class')).to.eventually.not.contain('ng-invalid');
  }
};

// expose routes to the view
module.exports = {

  // get an <input> element by its ng-model
  input : function input(model, value) {
    return element(by.model(model)).sendKeys('').sendKeys(value);
  },

  // clear an input's value.  Only works for <input> and <textarea>
  clear : function input(model) {
    return element(by.model(model)).clear();
  },

  // get a <select> element by its ng-model.
  select: function select(model) {
    return element(by.model(model)).all(by.tagName('option'));
  },

  // get a radio button by its position and click
  radio : function radio(model, n) {
    return element.all(by.model(model)).get(n).click();
  },

  // asserts whether an element exists or not
  exists : function exists(locator, bool) {
    expect(element(locator).isPresent()).to.eventually.equal(bool);
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
