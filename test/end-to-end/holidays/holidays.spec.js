const helpers = require('../shared/helpers');
const HolidayPage = require('./holidays.page');

describe('Holidays Management', () => {
  before(() => helpers.navigate('#!/holidays'));

  const page = new HolidayPage();

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

  it('successfully creates a new holiday', () => {
    return page.create(holiday);
  });

  it('successfully edits a holiday', () => {
    return page.update(holiday.label, updateHoliday);
  });

  it('prevent the definition of a nested vacation period', () => {
    return page.preventHoliday(nestedHoliday);
  });

  it('don\'t create when incorrect Holiday', () => {
    return page.errorOnCreateHoliday();
  });

  it('successfully delete a holiday', () => {
    return page.remove(updateHoliday.label);
  });
});
