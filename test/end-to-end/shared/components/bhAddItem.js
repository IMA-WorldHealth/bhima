/* global element, by */

const FU = require('../FormUtils');

module.exports = {
  selector : '[bh-add-item]',
  set      : function set(increment) {
    // get the input and enter the increment provided
    FU.input('$ctrl.itemIncrement', increment);

    // submit the value
    // var submit = element(by.id('btn-add-rows'));
    // submit.click();
    element(by.id('btn-add-rows')).click();

  },
};
