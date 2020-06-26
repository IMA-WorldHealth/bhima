/* global element, by */
const { expect } = require('chai');

const Filters = require('../shared/components/bhFilters');
const SearchModal = require('../shared/search.page');
const components = require('../shared/components');
const FU = require('../shared/FormUtils');
const GU = require('../shared/GridUtils');

function PatientRegistrySearch() {
  let modal;
  let filters;

  const parameters = {
    patientGroup : 'Test Patient Group 2',
    name : 'Mock',
    name1 : 'Patient',
    dateRegistrationFrom : '01/01/2015',
    dateRegistrationTo : '01/04/2015',
    dateBirthFrom : '01/05/2016',
    dateBirthTo : '16/05/2016',
    dateBirthFrom2 : '30/01/1960',
    dateBirthTo2 : '16/05/2016',
    originVillageName : 'Gombe',
  };

  const grid = element(by.id('patient-registry'));
  const rows = grid.element(by.css('.ui-grid-render-container-body'))
    .all(by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index'));

  beforeEach(async () => {
    await SearchModal.open();
    modal = new SearchModal('patient-search');
    filters = new Filters();
  });

  afterEach(async () => {
    await filters.resetFilters();
  });

  async function expectNumberOfGridRows(number) {
    expect(await rows.count(),
      `Expected Patient Registry ui-grid's row count to be ${number}.`).to.equal(number);
  }

  it('grid should have 5 visible rows', async () => {
    const DEFAULT_PATIENTS_FOR_TODAY = 5;
    await modal.switchToDefaultFilterTab();
    await modal.setPeriod('today');
    await modal.submit();

    await expectNumberOfGridRows(DEFAULT_PATIENTS_FOR_TODAY);
  });
  // demonstrates that filtering works
  it(`should find one patient with name "${parameters.name}"`, async () => {
    const NUM_MATCHING = 1;
    await FU.input('$ctrl.searchQueries.display_name', parameters.name);
    await FU.modal.submit();

    await expectNumberOfGridRows(NUM_MATCHING);
  });

  it(`should find two patients with Debtor Group "NGO IMA World Health"`, async () => {
    const NUM_MATCHING = 2;

    await components.debtorGroupSelect.set('NGO IMA World Health');
    await FU.modal.submit();

    await expectNumberOfGridRows(NUM_MATCHING);
  });

  // demonstrates additive filters
  it(`should find three "male" patients with name "${parameters.name1}"`, async () => {
    const NUM_MATCHING = 3;
    await FU.input('$ctrl.searchQueries.display_name', parameters.name1);
    await element(by.id('male')).click();
    await FU.modal.submit();

    await expectNumberOfGridRows(NUM_MATCHING);
  });

  // demonstrates that additive + time-delimited filtering works
  it(`should find one patient with name "${parameters.name1}" registered in the last week`, async () => {
    const NUM_MATCHING = 0;
    await FU.input('$ctrl.searchQueries.display_name', parameters.name1);
    await modal.switchToDefaultFilterTab();
    await modal.setPeriod('lastWeek');
    await FU.modal.submit();

    await expectNumberOfGridRows(NUM_MATCHING);
  });

  it(`should find two patient with patient group "${parameters.patientGroup}" registered in allTime`, async () => {
    const NUM_MATCHING = 2;
    await components.patientGroupSelect.set(parameters.patientGroup);
    await modal.switchToDefaultFilterTab();
    await modal.setPeriod('allTime');
    await FU.modal.submit();

    await expectNumberOfGridRows(NUM_MATCHING);
  });

  it(`should find patients with origin location "${parameters.originVillageName}" `, async () => {
    const NUM_MATCHING = 6;
    await FU.input('$ctrl.searchQueries.originLocationLabel', parameters.originVillageName);
    await FU.modal.submit();
    await expectNumberOfGridRows(NUM_MATCHING);
  });

  // demonstrates that sex + time-delimited filtering works
  it('should find one female patients registered in the last year.', async () => {
    const NUM_MATCHING = 0;
    await element(by.id('female')).click();
    await modal.switchToDefaultFilterTab();
    await modal.setPeriod('lastYear');
    await FU.modal.submit();

    await expectNumberOfGridRows(NUM_MATCHING);
  });

  // changes every single date input manually.
  it('should not find any patients with complex limited dates.', async () => {
    const NUM_MATCHING = 5;
    await components.dateInterval.range(parameters.dateBirthFrom2, parameters.dateBirthTo2, 'dob-date');
    await modal.switchToDefaultFilterTab();
    await modal.setPeriod('allTime');
    await FU.modal.submit();

    await expectNumberOfGridRows(NUM_MATCHING);
  });

  // clears filters to assert that the "error state" bug does not occur when the
  // cancel button is clicked
  it('clearing filters restores default number of rows to the grid', async () => {
    const NUM_MATCHING = 4;
    await element(by.id('male')).click();
    await modal.switchToDefaultFilterTab();
    await modal.setPeriod('allTime');
    await FU.modal.submit();

    await expectNumberOfGridRows(NUM_MATCHING);
  });

  it('should remember the cached filters', async () => {
    const NUM_MATCHING = 0;
    await element(by.id('male')).click();
    await FU.input('$ctrl.searchQueries.display_name', 'Some Non-Existant Patient');
    await modal.switchToDefaultFilterTab();
    await modal.setPeriod('year');
    await FU.modal.submit();

    await expectNumberOfGridRows(NUM_MATCHING);
  });

  it('bulk group assignment without selecting patients warns the user', async () => {
    await FU.modal.cancel();
    await element(by.id('menu')).click();
    await $('[data-method="change-patient-group"]').click();
    await components.notification.hasWarn();
  });

  it('changes the patient group for multiple patients', async () => {
    await FU.modal.cancel();
    const gridId = 'patient-registry';
    await GU.selectRow(gridId, 0);
    await GU.selectRow(gridId, 1);

    await element(by.id('menu')).click();
    await $('[data-method="change-patient-group"]').click();

    const group1 = '0B8FCC008640479D872A31D36361FCFD';
    const group2 = '112A9FB5847D4C6A9B20710FA8B4DA22';

    await element(by.id(group1)).click();
    await element(by.id(group2)).click();
    await FU.modal.submit();
    await components.notification.hasSuccess();

    // deselect groups
    await GU.selectRow(gridId, 0);
    await GU.selectRow(gridId, 1);
  });

}

module.exports = PatientRegistrySearch;
