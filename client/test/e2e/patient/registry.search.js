/* global element, by, browser */
const chai = require('chai');
const expect = chai.expect;
const helpers = require('../shared/helpers');
helpers.configure(chai);

const FU = require('../shared/FormUtils');

module.exports = PatientRegistrySearch;

/*
 * Patient Search Tests
 *
 * These test ensure that the Patient Search Modal behaves properly.
 */
function PatientRegistrySearch() {

  const parameters = {
    name: 'Mock',
    name1: 'Patient',
    dateRegistrationFrom: '2015-01-01',
    dateRegistrationTo: '2015-04-01',
    dateBirthFrom: '2016-05-01',
    dateBirthTo: '2016-05-16',
    dateBirthFrom2: '1960-06-30',
    dateBirthTo2: '2016-05-16'
  };

  const defaultVisibleRowNumber = 3;
  const grid = element(by.id('patient-registry'));
  const rows = grid.element(by.css('.ui-grid-render-container-body'))
    .all(by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index'));


  function expectNumberOfGridRows(number) {
    expect(rows.count(),
      `Expected Patient Registry ui-grid's row count to be ${number}.`
    ).to.eventually.equal(number);
  }

  function expectNumberOfFilters(number) {
    const filters = $('[data-bh-filter-bar]').all(by.css('.label'));
    expect(filters.count(),
      `Expected Patient Registry bh-filter-bar's filter count to be ${number}.`
    ).to.eventually.equal(number);
  }

  // ensure the grid loads!
  it('grid should have 3 visible rows', function () {
    expectNumberOfGridRows(defaultVisibleRowNumber);
    expectNumberOfFilters(0);
  });

  // demonstrates that filtering works
  it(`should find one patient with name "${parameters.name}"`, () => {
    FU.buttons.search();
    FU.input('ModalCtrl.params.name', parameters.name);
    FU.modal.submit();

    expectNumberOfGridRows(1);
    expectNumberOfFilters(1);
    FU.buttons.clear();
  });

  // demonstrates additive filters
  it(`should find two "male" patients with name "${parameters.name1}"`, function () {
    FU.buttons.search();
    FU.input('ModalCtrl.params.name', parameters.name1);
    element(by.id('male')).click();
    FU.modal.submit();

    expectNumberOfGridRows(2);
    expectNumberOfFilters(2);
    FU.buttons.clear();
  });

  // demonstrates that additive + time-delimited filtering works
  it(`should find one patient with name "${parameters.name1}" registered in the last week`, function () {
    FU.buttons.search();
    FU.input('ModalCtrl.params.name', parameters.name1);
    $('[data-date-registration]').$('[data-date-range="week"]').click();
    FU.modal.submit();

    expectNumberOfGridRows(1);
    expectNumberOfFilters(3);
    FU.buttons.clear();
  });

  // demonstrates that sex + time-delimited filtering works
  it('should find one female patient registered in the last year.', function () {
    FU.buttons.search();
    $('[data-date-registration]').$('[data-date-range="year"]').click();
    element(by.id('female')).click();
    FU.modal.submit();

    expectNumberOfGridRows(1);
    expectNumberOfFilters(3);
    FU.buttons.clear();
  });

  // changes every single date input manually.
  it('should not find any patients with complex limited dates.', function () {
    FU.buttons.search();

    FU.input('ModalCtrl.params.dateRegistrationFrom', parameters.dateRegistrationFrom);
    FU.input('ModalCtrl.params.dateRegistrationTo', parameters.dateRegistrationTo);
    FU.input('ModalCtrl.params.dateBirthFrom', parameters.dateBirthFrom);
    FU.input('ModalCtrl.params.dateBirthTo', parameters.dateBirthTo);

    FU.modal.submit();

    expectNumberOfGridRows(0);
    expectNumberOfFilters(4);
    FU.buttons.clear();
  });

  // combines dates with manual date manipulation
  it('setting dates manually should find two patients.', function () {
    FU.buttons.search();

    FU.input('ModalCtrl.params.dateBirthFrom', parameters.dateBirthFrom2);
    FU.input('ModalCtrl.params.dateBirthTo', parameters.dateBirthTo2);

    element(by.id('male')).click();

    FU.modal.submit();

    expectNumberOfGridRows(2);
    expectNumberOfFilters(3);
    FU.buttons.clear();
  });

  // clears filters to assert that the "error state" bug does not occur when the
  // cancel button is clicked
  it('clearing filters restores default number of rows to the grid', () => {
    FU.buttons.search();
    $('[data-date-registration]').$('[data-date-range="year"]').click();
    element(by.id('male')).click();
    FU.modal.submit();

    expectNumberOfGridRows(2);
    expectNumberOfFilters(3);

    // click the "clear filters" button
    FU.buttons.clear();

    // the filter bar shouldn't exist
    expectNumberOfGridRows(defaultVisibleRowNumber);
    expectNumberOfFilters(0);
  });

  it('should remember the cached filters', () => {

    FU.buttons.search();

    // Add all the filters (4 in total)
    $('[data-date-dob]').$('[data-date-range="year"]').click();
    element(by.id('male')).click();
    FU.input('ModalCtrl.params.name', 'Some Non-Existant Patient');

    FU.modal.submit();

    expectNumberOfGridRows(0);
    expectNumberOfFilters(4);

    browser.refresh();

    expectNumberOfGridRows(0);
    expectNumberOfFilters(4);
    FU.buttons.clear();
  });
}
