/* global element, by */

/**
 * hooks for the Date Interval component described in the component
 * bhDateInterval.spec.js
 * @public
 */
'use strict';

const DateEditor = require('./bhDateEditor');

module.exports = {
  root: element(by.css('[data-bh-date-interval]')),

  /** sets the value of the date start */
  dateFrom: function dateFrom(value) {
    let elt = this.root.element(by.model('$ctrl.dateFrom'));
    elt.clear().sendKeys(value);
  },

  /** sets the value of the date stop */
  dateTo: function dateTo(value) {
    let elt = this.root.element(by.model('$ctrl.dateTo'));
    elt.clear().sendKeys(value);
  },

  range: function range(start, end) {
    this.dateFrom(start);
    this.dateTo(end);
  }

};
