/* global element, by */

const FU = require('../FormUtils');

module.exports = {
  selector : '[bh-add-item]',
  set      : function set(increment, anchor) {
    // get the input and enter the increment provided
    FU.input('$ctrl.itemIncrement', increment, anchor);

    const btn = anchor ?
      anchor.element(by.id('btn-add-rows')) :
      element(by.id('btn-add-rows'));

    // submit the value
    btn.click();
  },
};
