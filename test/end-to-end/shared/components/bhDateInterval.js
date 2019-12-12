/* global element, by */

/**
 * hooks for the Date Interval component described in the component
 * bhDateInterval.spec.js
 * @public
 */

module.exports = {
  root : element(by.css('[data-bh-date-interval]')),

  /** sets the value of the date start */
  dateFrom : function dateFrom(value, id) {
    let ctx = this.root;
    if (id) {
      ctx = element(by.css(`[date-id="${id}"]`));
    }
    const elt = ctx.element(by.model('$ctrl.dateFrom'));
    return elt.clear().sendKeys(value);
  },

  /** sets the value of the date stop */
  dateTo : function dateTo(value, id) {
    let ctx = this.root;
    if (id) {
      ctx = element(by.css(`[date-id="${id}"]`));
    }
    const elt = ctx.element(by.model('$ctrl.dateTo'));
    return elt.clear().sendKeys(value);
  },

  range : async function range(start, end, id) {
    await this.dateFrom(start, id);
    await this.dateTo(end, id);
  },
};
