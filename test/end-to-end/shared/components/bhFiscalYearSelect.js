/* global browser, element, by */

const FU = require('../FormUtils');

module.exports = {
  mainSelector : '[bh-fiscal-year-select]',
  set : function set(fiscal_year_id, id) {
      var opts;
    /** return selector for an option element */
    function getValue(id) {
      return by.css('option[value="number:?"]'.replace('?', id));
    }

    const bhFiscal = (id) ? element(by.id(id)) : element(by.css(this.mainSelector));

    opts = bhFiscal.element(by.model('$ctrl.selectedFiscal'));
    opts.element(getValue(fiscal_year_id)).click();
  },
};