const helpers = require('../shared/helpers');
const WeekEndConfigPage = require('./weekend_config.page');
const chai = require('chai');

/* configuring helpers */
helpers.configure(chai);

describe('Week End Configuration Management', () => {
  // navigate to the page
  before(() => helpers.navigate('#!/payroll/weekend_configuration'));

  const Page = new WeekEndConfigPage();

  const weekEndConfig = {
    label : 'Configuration Week End 2013',
  };

  const updateWeekEndConfig = {
    label : 'Configuration Week End 2013 Updated',
  };

  it('successfully creates a new WeekEnd Configuration', () => {
    Page.createWeekEndConfig(weekEndConfig);
  });

  it('successfully edits a WeekEnd Configuration', () => {
    Page.editWeekEndConfig(weekEndConfig.label, updateWeekEndConfig);
  });

  it('successfully Set Week days in WeekEnd Configuration', () => {
    Page.setWeekEndConfig(updateWeekEndConfig.label);
  });

  it('successfully InSet Week days in WeekEnd Configuration', () => {
    Page.inSetWeekEndConfig(updateWeekEndConfig.label);
  });

  it('don\'t create when incorrect WeekEnd', () => {
    Page.errorOnCreateWeekEndConfig();
  });

  it('successfully delete a WeekEnd', () => {
    Page.deleteWeekEndConfig(updateWeekEndConfig.label);
  });

});
