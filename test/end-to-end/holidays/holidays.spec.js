const helpers = require('../shared/helpers');
const HolidayPage = require('./holidays.page');
const chai = require('chai');


/** configuring helpers**/
helpers.configure(chai);

describe('Holidays Management', () => {
  // navigate to the page
  before(() => helpers.navigate('#!/holidays'));

  const Page = new HolidayPage();

  const holiday = {
    employee_id : 1,
    percentage  : 100,
    label       : 'Conge de circonstance',
    dateFrom    : '17/05/2017',
    dateTo      : '30/06/2017',
  };

  const nestedHoliday = {
    employee_id : 1,
    percentage  : 100,
    label       : 'Conge de Imbrique',
    dateFrom    : '12/06/2017',
    dateTo      : '20/06/2017',
  };

  const updateHoliday = {
    label : 'Conge Paye',
    percentage : 75
  };

  it('successfully creates a new Holiday', () => {
    Page.createHoliday(holiday);
  });

  it('successfully edits a Holiday', () => {
    Page.editHoliday(holiday.label, updateHoliday);
  });

  it('Prevent the definition of a nested vacation period', () => {
    Page.preventHoliday(nestedHoliday);
  });

  it('don\'t create when incorrect Holiday', () => {
    Page.errorOnCreateHoliday();
  });

  it('successfully delete a Holiday', () => {
    Page.deleteHoliday(updateHoliday.label);
  });

});