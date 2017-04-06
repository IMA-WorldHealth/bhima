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
  dateFrom: function dateFrom(value, id) {
    let ctx = this.root;
    if (id) {
      ctx = element(by.css(`[date-id="${id}"]`));
    }
    let elt = ctx.element(by.model('$ctrl.dateFrom'));
    elt.clear().sendKeys(value);
  },

  /** sets the value of the date stop */
  dateTo: function dateTo(value, id) {
    let ctx = this.root;
    if (id) {
      ctx = element(by.css(`[date-id="${id}"]`));
    }
    let elt = ctx.element(by.model('$ctrl.dateTo'));
    elt.clear().sendKeys(value);
  },

  range: function range(start, end, id) {
    this.dateFrom(start, id);
    this.dateTo(end, id);
  }
};
