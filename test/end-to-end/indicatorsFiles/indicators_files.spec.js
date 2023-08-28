const { chromium } = require('@playwright/test');
const { test } = require('@playwright/test');
const TU = require('../shared/TestUtils');

test.beforeAll(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  TU.registerPage(page);
  await TU.login();
});

const IndicatorsFilesPage = require('./indicators_files.page');

test.describe('Patient IndicatorsFiles', () => {

  let page;

  const path = '/#!/dashboards/indicators_files_registry';

  test.beforeEach(async () => {
    await TU.navigate(path);
    page = await IndicatorsFilesPage.new();
  });

  const fiscalYearLabel = 'Fiscal Year 2019';
  const periodLabel = 'January 2019';
  const service = 'Medecine Interne';
  const hospitalizationIndicators = {
    total_day_realized : 10,
    total_beds : 10,
    total_hospitalized_patient : 10,
    total_death : 10,
  };
  const staffIndicators = {
    total_day_realized : 10,
    total_doctors : 10,
    total_nurses : 10,
    total_caregivers : 10,
    total_staff : 10,
    total_external_visit : 10,
    total_visit : 10,
    total_surgery_by_doctor : 10,
    total_hospitalized_patient : 10,
  };

  const financeIndicators = {
    total_revenue : 10,
    total_subsidies : 10,
    total_drugs_sale : 10,
    total_expenses : 10,
    total_other_charge : 10,
    total_drugs_purchased : 10,
    total_staff_charge : 10,
    total_operating_charge : 10,
    total_depreciation : 10,
    total_debts : 10,
    total_cash : 10,
    total_stock_value : 10,
    total_staff : 10,
  };

  test('successfully creates a new hospitalization file', async () => {
    await page.createHospitalizationIndicatorsFiles(fiscalYearLabel, periodLabel, hospitalizationIndicators, service);
  });

  test('successfully creates a new staff file', async () => {
    await page.createStaffIndicatorsFiles(fiscalYearLabel, periodLabel, staffIndicators);
  });

  test('successfully creates a new finance file', async () => {
    await page.createFinanceIndicatorsFiles(fiscalYearLabel, periodLabel, financeIndicators);
  });

  test('search indicators files by period', async () => {
    const options = {
      fiscalYear : 'Fiscal Year 2019',
      period : 'January 2019',
    };

    await page.search(options);
    await page.expectNumberOfGridRows(3);

    options.period = 'February 2019';
    await page.search(options);
    await page.expectNumberOfGridRows(0);
  });

});
