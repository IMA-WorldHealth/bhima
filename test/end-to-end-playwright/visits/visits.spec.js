const { chromium } = require('@playwright/test');
const { test } = require('@playwright/test');
const TU = require('../shared/TestUtils');

const VisitsPage = require('./visits.page');

test.beforeAll(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  TU.registerPage(page);
  await TU.login();
});

test.describe('Patient Visits', () => {

  const path = '/#!/patients/visits';

  test.beforeEach(async () => {
    await TU.navigate(path);
  });

  test.beforeEach(async () => {
    await TU.navigate(path);
  });

  const page = new VisitsPage();

  const defaultVisit = {
    patient : 'Test 2 Patient',
    service : 'Medecine Interne',
    diagnosis : 'Paludisme a Plasmodium malariae, (sans complication)',
    note : 'Malaria',
  };

  const hospiVisit = {
    patient : 'Employee Test 1', // a female patient
    service : 'Medecine Interne',
    note : 'Femme enceint',
    ward : 'Pavillon A',
    room : 'Room A in Ward A',
  };

  const OLD_VISITS = 0;
  const NEW_VISITS = 2;

  test('successfully creates a new visit', () => {
    return page.createVisitSuccess(
      defaultVisit.patient,
      defaultVisit.service,
      defaultVisit.diagnosis,
      defaultVisit.note,
    );
  });

  test('forbid to create a new visit for a pending patient', () => {
    return page.createVisitFail(
      defaultVisit.patient,
      defaultVisit.service,
      defaultVisit.diagnosis,
      defaultVisit.note,
    );
  });

  test('successfully creates a new hospitalization visit', async () => {
    await page.createVisitSuccess(
      hospiVisit.patient,
      hospiVisit.service,
      hospiVisit.diagnosis,
      hospiVisit.note,
      true, true, true, true, true,
      hospiVisit.ward,
      hospiVisit.room,
    );
  });

  test('counts visits in the registry', async () => {
    await page.expectNumberOfGridRows(OLD_VISITS + NEW_VISITS);
  });

  test('search only hospitalized patients', async () => {
    const options = {
      isHospitalized : 1,
    };
    await page.search(options);
    await page.expectNumberOfGridRows(1);
  });

  test('search by patient name', async () => {
    const options = {
      displayName : 'Test 2 Patient',
    };
    await page.search(options);
    await page.expectNumberOfGridRows(OLD_VISITS + 1);
  });

  test('search pregnant visits', async () => {
    const options = {
      isPregnant : 1,
    };
    await page.search(options);
    await page.expectNumberOfGridRows(1);
  });

  test('search patient visits by service', async () => {
    const options = {
      service : 'Medecine Interne',
    };
    await page.search(options);
    await page.expectNumberOfGridRows(OLD_VISITS + 2);
  });

  test('search patient visits by ward', async () => {
    const options = {
      ward : 'Pavillon A',
    };
    await page.search(options);
    await page.expectNumberOfGridRows(1);

    options.ward = 'Pavillon B';
    await page.search(options);
    await page.expectNumberOfGridRows(0);
  });

  test('search patient visits', async () => {
    const options = {
      isHospitalized : 1,
      displayName : 'Test 2 Patient',
    };
    await page.search(options);
    await page.expectNumberOfGridRows(0);
  });

});
