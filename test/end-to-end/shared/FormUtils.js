/* eslint-disable no-param-reassign */
/* eslint-disable no-shadow */
/* global by, element */
const { expect } = require('chai');

// These buttons depend on custom data tags to indicate actions.  This seems
// cleaner than using a whole bunch of ids which may potentially collide.
// However, this decision can be reviewed
const buttons = {
  create : () => $('[data-method="create"]').click(),
  search : () => $('[data-method="search"]').click(),
  submit : () => $('[data-method="submit"]').click(),
  cancel : () => $('[data-method="cancel"]').click(),
  edit   : () => $('[data-method="edit"]').click(),
  clear  : () => $('[data-method="clear"]').click(),
  print  : () => $('[data-method="print"]').click(),
  back   : () => $('[data-method="back"]').click(),
  reset  : () => $('[data-method="reset"]').click(),
  delete : () => $('[data-method="delete"]').click(),
  configure : () => $('[data-method="configure"]').click(),
  add : () => $('[data-method="add"]').click(),
  save : () => $('[data-method="save"]').click(),
  grouping : () => $('[data-method="grouping"]').click(),
};

// This methods are for easily working with modals.  Works with the same custom
// data tags used in form buttons.
const modal = {
  submit : function submit() { return $('[uib-modal-window] [data-method="submit"]').click(); },
  cancel : function cancel() { return $('[uib-modal-window] [data-method="cancel"]').click(); },
  close : function close() { return $('[uib-modal-window] [data-method="close"]').click(); },
  print : function print() { return $('[uib-modal-window] [data-method="print"]').click(); },
};

// convenience methods to see if the form contains feedback text.  Returns locators.
const feedback = {
  success : function success() { return by.css('[data-role="feedback"] > .text-success'); },
  error : function error() { return by.css('[data-role="feedback"] > .text-danger'); },
  warning : function warning() { return by.css('[data-role="feedback"] > .text-warning'); },
  info : function info() { return by.css('[data-role="feedback"] > .text-info'); },
};

// convenience methods to check form element validation states
const validation = {

  // an error state is present
  error : async function error(model) {
    expect(
      await element(by.model(model)).getAttribute('class'),
      `Expected ${model} to be invalid, but could not find the ng-invalid class.`,
    ).to.contain('ng-invalid');
  },

  // no error state present
  ok : async function success(model) {
    expect(
      await element(by.model(model)).getAttribute('class'),
      `Expected ${model} to be valid, but could not find the ng-valid class.`,
    ).to.contain('ng-valid');
  },
};

// expose routes to the view
module.exports = {

  // get an <input> element by its ng-model
  input : async function input(model, value, anchor) {

    // get the HTML <input> element
    const input = anchor
      ? anchor.element(by.model(model))
      : element(by.model(model));

    await input.clear().sendKeys(value);

    return input;
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
  select : function select(model, option, anchor = $('body')) {
    const select = anchor.element(by.model(model));
    const choice = select.element(by.cssContainingText('option', option));
    return choice.click();
  },

  // get a radio button by its position and click
  radio : function radio(model, n) {
    return element.all(by.model(model)).get(n).click();
  },

  // asserts whether an element exists or not
  exists : async function exists(locator, bool) {
    expect(
      await element(locator).isPresent(),
      `Expected locator ${locator.toString()} to ${bool ? '' : 'not'} exist.`,
    ).to.equal(bool);
  },

  // asserts whether an element is visible on the page or not.
  visible : async function visible(locator, bool) {
    expect(
      await element(locator).isDisplayed(),
      `Expected locator ${locator.toString()} to ${bool ? 'not ' : ' '}be visible.`,
    ).to.equal(bool);
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
  typeahead : async function typeahead(model, label, anchor) {
    anchor = anchor || $('body');

    // type into the <input> element
    await this.input(model, label, anchor);

    // select the item of the dropdown menu matching the label
    const option = anchor.element(by.cssContainingText('.dropdown-menu > [role="option"]', label));
    await option.click();
  },

  /**
   * @method typeaheadAppended
   *
   * @description
   * Selects an option from the ui-select dropdown
   * which have the `append-to-body` option set to true
   *
   * @param {String} model - the ng-model target to select
   * @param {String} label - the text of the option element to choose
   * @param {Element} anchor - a protractor element to search within
   * @returns {Element} - a protractor option element
   */
  typeaheadAppended : async function typeaheadAppended(model, label, anchor) {
    const externalAnchor = $('body > ul.dropdown-menu.ng-isolate-scope:not(.ng-hide)');

    // type into the <input> element the searchable value
    await this.input(model || '$ctrl.account', label, anchor || $('body'));

    // select the item of the dropdown menu matching the label
    const option = externalAnchor.element(by.cssContainingText('[role="option"]', label));
    await option.click();
  },

  /**
   * @method uiSelect
   *
   * @description
   * Selects an option from the ui-select dropdown
   *
   * @param {String} model - the ng-model target to select
   * @param {String} label - the text of the option element to choose
   * @param {Element} anchor - a protractor element to search within
   * @param {boolean} isMultipleSelection
   * @param {String} searchType contains|exact|fullWord|accountName
   * @returns {Element} - a protractor option element
   */
  uiSelect : async function uiSelect(
    model, label, anchor, isMultipleSelection, searchType = 'contains',
  ) {
    anchor = anchor || $('body');

    // get the HTML <div> element that will trigger the select input
    const select = anchor
      ? anchor.element(by.model(model))
      : element(by.model(model));

    // trigger the <input> rendering
    await select.click();

    // type into the <input> element the searchable value
    // only for multiple selection
    if (isMultipleSelection) {
      await this.input('$select.search', label, select);
    }

    // select the item of the dropdown menu matching the label
    let searchString = label;
    let labelForRegex = label.replace('(', '\\(');
    labelForRegex = labelForRegex.replace(')', '\\)');

    switch (searchType) {
    case 'exact':
      searchString = new RegExp(`^\\s*${labelForRegex}$`, 'm');
      break;
    case 'fullWord':
      searchString = new RegExp(`\\s+${labelForRegex}(\\s|$)`);
      break;
    case 'accountName':
      searchString = new RegExp(`\\d+\\s+${labelForRegex}\\s+`);
      break;
    default:
    case 'contains':
      searchString = label;
      break;
    }

    const option = select.element(
      by.cssContainingText(
        '.dropdown-menu [role="option"]', searchString,
      ),
    );
    await option.click();
  },

  /**
   * @method uiSelectAppended
   *
   * @description
   * Selects an option from the ui-select dropdown
   * which have the `append-to-body` option set to true
   *
   * @param {String} model - the ng-model target to select
   * @param {String} label - the text of the option element to choose
   * @param {Element} anchor - a protractor element to search within
   * @returns {Element} - a protractor option element
   */
  uiSelectAppended : async function uiSelectAppended(model, label, anchor) {
    const externalAnchor = $('body > div.ui-select-bootstrap.dropdown');

    // click on the element
    anchor = anchor || $('body');
    await anchor.element(by.model(model)).click();

    // type into the <input> element the searchable value
    await this.input('$select.search', label, externalAnchor);

    // select the item of the dropdown menu matching the label
    const option = externalAnchor.element(by.cssContainingText('.dropdown-menu [role="option"]', label));
    await option.click();
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
  dropdown : async function dropdown(selector, label, anchor) {
    anchor = anchor || $('body');

    // open the dropdown menu
    await $(selector).click();

    const option = anchor.element(by.cssContainingText('[uib-dropdown-menu] > li', label));
    await option.click();
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
  hasText : async function hasText(locator, text) {
    expect(
      await element(locator).getText(),
      `Expected locator ${locator.toString()} to contain "${text}".`,
    ).to.equal(text);
  },

  // bind commonly used form buttons  These require specific data tags to be
  // leveraged effectively.
  buttons,

  // bind commonly shown feedback utilities
  // to detect feedback, the parent element must have the
  // [data-role="feedback"] attribute assigned to it.
  feedback,

  // bind validation states.  Each method takes in a model's string and asserts
  // the validation state.
  validation,

  // bindings for modal overlay forms
  modal,

  // chains an array of promises and runs them in series.
  series : async (array, callback) => {
    return array.reduce(
      (promise, element, index, array) => promise.then(() => callback(element, index, array)),
      Promise.resolve(),
    );
  },
};
