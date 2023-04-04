const TU = require('../TestUtils');
const { by } = require('../TestUtils');

/**
 * hooks for the Date Interval component described in the component
 * bhDateInterval.spec.js
 */

const selector = '[data-bh-date-interval]';

module.exports = {
  // ??? root : TU.locator('[data-bh-date-interval]'),

  /** sets the value of the date start */
  dateFrom : async function dateFrom(value, id) {
    let ctx = this.root;
    if (id) {
      ctx = TU.locator(`[date-id="${id}"]`);
    }
    const elt = ctx.TU.locator(by.model('$ctrl.dateFrom'));
    return elt.clear().sendKeys(value);
  },

  /** sets the value of the date stop */
  dateTo : function dateTo(value, id) {
    let ctx = this.root;
    if (id) {
      ctx = TU.locator(`[date-id="${id}"]`);
    }
    const elt = ctx.TU.locator(by.model('$ctrl.dateTo'));
    return elt.clear().sendKeys(value);
  },

  range : async function range(start, end, id) {
    await this.dateFrom(start, id);
    await this.dateTo(end, id);
  },
};
