/* global element, by */

const moment = require('moment');

/**
 * hooks for the Date Picker component described in the component
 * bhDatePicker.js
 * @public
 */

module.exports = {
  /**
   * @param {date} dateString - date string (YYYY-MM-DD). Ex. 2017-04-17
   * @param {object} anchor - A protractor element as parent
   */
  set : function (dateString, anchor) {
    const root = anchor || $('body');

    const date = moment(dateString).format('DD/MM/YYYY');

    root.element(by.model('$ctrl.date')).clear().sendKeys(date);
  },
};
