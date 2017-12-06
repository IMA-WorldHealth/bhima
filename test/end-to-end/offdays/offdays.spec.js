const helpers = require('../shared/helpers');
const OffdayPage = require('./offdays.page');
const chai = require('chai');


/** configuring helpers**/
helpers.configure(chai);

describe('Offdays Management', () => {
  // navigate to the page
  before(() => helpers.navigate('#!/offdays'));

  const Page = new OffdayPage();

  const offday = {    
    label         : 'Fete de Parent',
    date          : '2017-08-01',
    percent_pay   : 100
  };

  const updateOffday = {
    label         : 'Vingt',
    date          : '2017-11-24',
    percent_pay   : 100    
  };

  it('successfully creates a new Offday', () => {
    Page.createOffday(offday);
  });

  it('successfully edits a Offday', () => {
    Page.editOffday(offday.label, updateOffday);
  });

  it('don\'t create when incorrect Offday', () => {
    Page.errorOnCreateOffday();
  });

  it('successfully delete a Offday', () => {
    Page.deleteOffday(updateOffday.label);
  });

});