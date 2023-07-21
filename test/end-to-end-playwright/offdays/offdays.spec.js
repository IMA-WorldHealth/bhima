const { chromium } = require('@playwright/test');
const { test } = require('@playwright/test');
const TU = require('../shared/TestUtils');

const OffdayPage = require('./offdays.page');

test.beforeAll(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  TU.registerPage(page);
  await TU.login();
});

test.describe('Offdays Management', () => {

  test.beforeEach(async () => {
    await TU.navigate('/#!/offdays');
  });

  const page = new OffdayPage();

  const offday = {
    label         : 'Fete de Parent',
    date          : new Date('2017-08-01'),
    percent_pay   : 100,
  };

  const updateOffday = {
    label         : 'Vingt',
    date          : new Date('2017-11-24'),
    percent_pay   : 100,
  };

  test('successfully creates a new Offday', () => {
    return page.createOffday(offday);
  });

  test('successfully edits a Offday', () => {
    return page.editOffday(offday.label, updateOffday);
  });

  test('do not create when incorrect Offday', () => {
    return page.errorOnCreateOffday();
  });

  test('successfully delete a Offday', () => {
    return page.deleteOffday(updateOffday.label);
  });

});
