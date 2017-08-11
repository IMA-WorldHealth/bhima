'use strict';

const chai = require('chai');
const expect = chai.expect;

const Filters = require('../shared/components/bhFilters');
const SearchModal = require('../shared/search.page');
const components = require('../shared/components');
const FU = require('../shared/FormUtils');

function PatientRegistrySearch() {
  let modal;
  let filters;

  const parameters = {
    patientGroup : 'Test Patient Group 2',
    name: 'Mock',
    name1: 'Patient',
    dateRegistrationFrom: '01/01/2015',
    dateRegistrationTo: '01/04/2015',
    dateBirthFrom: '01/05/2016',
    dateBirthTo: '16/05/2016',
    dateBirthFrom2: '30/01/1960',
    dateBirthTo2: '16/05/2016',
  };

  const grid = element(by.id('patient-registry'));
  const rows = grid.element(by.css('.ui-grid-render-container-body'))
    .all(by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index'));  

  beforeEach(() => {
    SearchModal.open();
    modal = new SearchModal('patient-search');
    filters = new Filters();
  });

  afterEach(() => {
    filters.resetFilters();
  });

  function expectNumberOfGridRows(number) {
    expect(rows.count(),
      `Expected Patient Registry ui-grid's row count to be ${number}.`
    ).to.eventually.equal(number);
  }

  it('grid should have 4 visible rows', () => {
    const DEFAULT_PATIENTS_FOR_TODAY = 4;
    modal.switchToDefaultFilterTab();
    modal.setPeriod('today');
    modal.submit();

    expectNumberOfGridRows(DEFAULT_PATIENTS_FOR_TODAY);
  });


  // demonstrates that filtering works
  it(`should find one patient with name "${parameters.name}"`, () => {
    const NUM_MATCHING = 1;
    FU.input('$ctrl.searchQueries.display_name', parameters.name);
    FU.modal.submit();

    expectNumberOfGridRows(NUM_MATCHING);
  });

  it(`should find three patient with Debtor Group "Second Test Debtor Group"`, () => {
    const NUM_MATCHING = 3;

    components.debtorGroupSelect.set('Second Test Debtor Group');
    FU.modal.submit();

    expectNumberOfGridRows(NUM_MATCHING);
  });

  // demonstrates additive filters
  it(`should find two "male" patients with name "${parameters.name1}"`, function () {
    const NUM_MATCHING = 2;
    FU.input('$ctrl.searchQueries.display_name', parameters.name1);
    element(by.id('male')).click();
    FU.modal.submit();

    expectNumberOfGridRows(NUM_MATCHING);
  });

  // demonstrates that additive + time-delimited filtering works
  it(`should find one patient with name "${parameters.name1}" registered in the last week`, function () {
    const NUM_MATCHING = 0;
    FU.input('$ctrl.searchQueries.display_name', parameters.name1);
    modal.switchToDefaultFilterTab();
    modal.setPeriod('lastWeek');
    FU.modal.submit();

    expectNumberOfGridRows(NUM_MATCHING);
  });

  it(`should find two patient with patient group "${parameters.patientGroup}" registered in allTime`, function () {
    const NUM_MATCHING = 2;
    components.patientGroupSelect.set(parameters.patientGroup);
    modal.switchToDefaultFilterTab();
    modal.setPeriod('allTime');
    FU.modal.submit();

    expectNumberOfGridRows(NUM_MATCHING);
  });

  // demonstrates that sex + time-delimited filtering works
  it('should find no female patients registered in the last year.', function () {
    const NUM_MATCHING = 0; 
    element(by.id('female')).click();
    modal.switchToDefaultFilterTab();
    modal.setPeriod('lastYear');
    FU.modal.submit();

    expectNumberOfGridRows(NUM_MATCHING);
  });

  // changes every single date input manually.
  it('should not find any patients with complex limited dates.', function () {
    const NUM_MATCHING = 4;
    components.dateInterval.range(parameters.dateBirthFrom2, parameters.dateBirthTo2, 'dob-date');
    modal.switchToDefaultFilterTab();
    modal.setPeriod('allTime');    
    FU.modal.submit();

    expectNumberOfGridRows(NUM_MATCHING);
  });

  // clears filters to assert that the "error state" bug does not occur when the
  // cancel button is clicked
  it('clearing filters restores default number of rows to the grid', () => {
    const NUM_MATCHING = 3;
    element(by.id('male')).click();
    modal.switchToDefaultFilterTab();
    modal.setPeriod('allTime');
    FU.modal.submit(); 

    expectNumberOfGridRows(NUM_MATCHING);
  });

  it('should remember the cached filters', () => {
    const NUM_MATCHING = 0;
    element(by.id('male')).click();
    FU.input('$ctrl.searchQueries.display_name', 'Some Non-Existant Patient');
    modal.switchToDefaultFilterTab();
    modal.setPeriod('year');
    FU.modal.submit();

    expectNumberOfGridRows(NUM_MATCHING);
  });
}

module.exports = PatientRegistrySearch;
