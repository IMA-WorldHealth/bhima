const helpers = require('../shared/helpers');
const WeekendConfigPage = require('./weekend_config.page');

describe('Weekend Configuration Management', () => {
  // navigate to the page
  before(() => helpers.navigate('#!/payroll/weekend_configuration'));

  const page = new WeekendConfigPage();

  const newWeekendConfigLabel = 'Configuration Weekend 2013';
  const updateWeekendConfigLabel = 'Configuration Weekend 2013 Updated';

  it('successfully creates a new weekend configuration', async () => {
    await page.create(newWeekendConfigLabel);
  });

  it('successfully edits a weekend configuration', async () => {
    await page.update(newWeekendConfigLabel, updateWeekendConfigLabel);
  });

  it('don\'t create an incorrect weekend', async () => {
    await page.errorOnCreateWeekendConfig();
  });

  it('successfully deletes a weekend', async () => {
    await page.remove(updateWeekendConfigLabel);
  });
});
