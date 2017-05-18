/* global by */
const dataAttribute = '[data-bh-period-select]';
const moment = require('moment');

const openSelections = () =>
  $('[ng-click="$ctrl.toggleSelectionOptions()"]').click();

exports.select = (period) => {
  openSelections();
  $(`${dataAttribute} [data-link="${period}"]`).click();
};

exports.custom = (start, end) => {
  const elm = $(dataAttribute);
  openSelections();

  const startFmt = moment(start).format('YYYY-MM-DD');
  elm.element(by.model('$ctrl.customSelection.from')).sendKeys(startFmt);

  const endFmt = moment(end).format('YYYY-MM-DD');
  elm.element(by.model('$ctrl.customSelection.to')).sendKeys(endFmt);
};
