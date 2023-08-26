const { chromium } = require('@playwright/test');
const { test } = require('@playwright/test');
const TU = require('../shared/TestUtils');

const HolidayPage = require('./holidays.page');

test.beforeAll(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  TU.registerPage(page);
  await TU.login();
});

test.describe('Holidays Management', () => {
  let page;

  test.beforeEach(async () => {
    await TU.navigate('/#!/holidays');
    page = await HolidayPage.new();
  });

  const holiday = {
    percentage  : 100,
    label       : 'Conge de circonstance',
    dateFrom    : '17/05/2017',
    dateTo      : '30/06/2017',
  };

  const nestedHoliday = {
    percentage  : 100,
    label       : 'Conge de Imbrique',
    dateFrom    : '12/06/2017',
    dateTo      : '20/06/2017',
  };

  const updateHoliday = {
    label : 'Conge Paye',
    percentage : 75,
  };

  test('successfully creates a new holiday', () => {
    return page.create(holiday);
  });

  test('successfully edits a holiday', () => {
    return page.update(holiday.label, updateHoliday);
  });

  test('prevent the definition of a nested vacation period', () => {
    return page.preventHoliday(nestedHoliday);
  });

  test('do not create when incorrect Holiday', () => {
    return page.errorOnCreateHoliday();
  });

  test('successfully delete a holiday', () => {
    return page.remove(updateHoliday.label);
  });
});
