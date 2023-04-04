/* global by */
const dataAttribute = '[data-bh-period-select]';
const moment = require('moment');

const openSelections = () => $('[ng-click="$ctrl.toggleSelectionOptions()"]').click();

exports.select = async (period) => {
  await openSelections();
  await $(`${dataAttribute} [data-link="${period}"]`).click();
};

exports.custom = async (start, end) => {
  const elm = $(dataAttribute);
  await openSelections();

  const startFmt = moment(start).format('YYYY-MM-DD');
  await elm.element(by.model('$ctrl.customSelection.from')).sendKeys(startFmt);

  const endFmt = moment(end).format('YYYY-MM-DD');
  await elm.element(by.model('$ctrl.customSelection.to')).sendKeys(endFmt);
};
