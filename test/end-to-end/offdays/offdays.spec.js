const helpers = require('../shared/helpers');
const OffdayPage = require('./offdays.page');

describe('Offdays Management', () => {
  before(() => helpers.navigate('#!/offdays'));

  const Page = new OffdayPage();

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

  it('successfully creates a new Offday', () => {
    return Page.createOffday(offday);
  });

  it('successfully edits a Offday', () => {
    return Page.editOffday(offday.label, updateOffday);
  });

  it('don\'t create when incorrect Offday', () => {
    return Page.errorOnCreateOffday();
  });

  it('successfully delete a Offday', () => {
    return Page.deleteOffday(updateOffday.label);
  });

});
