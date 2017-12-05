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
    percent_pay   : 100,
    label         : 'Fete de Parent',
    date          : '01/08/2017'
  };

  const updateOffday = {
    label         : 'Vingt Quatre Novembre',
    percent_pay   : 100,
    date          : '24/11/2017'
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