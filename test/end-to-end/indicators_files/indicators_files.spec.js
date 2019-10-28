/* global */
const helpers = require('../shared/helpers');
const IndicatorsFilesPage = require('./indicators_files.page');

describe('Patient IndicatorsFiles', () => {
  const path = '#!/dashboards/indicators_files_registry';
  beforeEach(() => helpers.navigate(path));

  const Page = new IndicatorsFilesPage();

  const fiscalYearLabel = 'Fiscal Year 2019';
  const periodLabel = 'Jan';
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

  it('successfully creates a new hospitalization file', async () => {
    await Page.createHospitalizationIndicatorsFiles(fiscalYearLabel, periodLabel, hospitalizationIndicators, service);
  });

  it('successfully creates a new staff file', async () => {
    await Page.createStaffIndicatorsFiles(fiscalYearLabel, periodLabel, staffIndicators);
  });

  it('successfully creates a new finance file', async () => {
    await Page.createFinanceIndicatorsFiles(fiscalYearLabel, periodLabel, financeIndicators);
  });

  it('search indicators files by period', async () => {
    const options = {
      fiscalYear : 'Fiscal Year 2019',
      period : 'Jan',
    };

    await Page.search(options);
    await Page.expectNumberOfGridRows(3);
    options.period = 'F';

    await Page.search(options);
    await Page.expectNumberOfGridRows(0);
  });
});
