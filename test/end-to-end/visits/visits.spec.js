const helpers = require('../shared/helpers');
const VisitsPage = require('./visits.page');

describe('Patient Visits', () => {
  const path = '#!/patients/visits';
  beforeEach(() => helpers.navigate(path));

  const Page = new VisitsPage();

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

  const OLD_VISITS = 1;
  const NEW_VISITS = 2;

  it('successfully creates a new visit', () => {
    return Page.createVisitSuccess(
      defaultVisit.patient,
      defaultVisit.service,
      defaultVisit.diagnosis,
      defaultVisit.note
    );
  });

  it('forbid to create a new visit for a pending patient', () => {
    return Page.createVisitFail(
      defaultVisit.patient,
      defaultVisit.service,
      defaultVisit.diagnosis,
      defaultVisit.note
    );
  });

  it('successfully creates a new hospitalization visit', async () => {
    await Page.createVisitSuccess(
      hospiVisit.patient,
      hospiVisit.service,
      hospiVisit.diagnosis,
      hospiVisit.note,
      true, true, true, true, true,
      hospiVisit.ward,
      hospiVisit.room
    );
  });

  it('counts visits in the registry', async () => {
    await Page.expectNumberOfGridRows(OLD_VISITS + NEW_VISITS);
  });

  it('search only hospitalized patients', async () => {
    const options = {
      isHospitalized : 1,
    };
    await Page.search(options);
    await Page.expectNumberOfGridRows(1);
  });

  it('search by patient name', async () => {
    const options = {
      displayName : 'Test 2 Patient',
    };
    await Page.search(options);
    await Page.expectNumberOfGridRows(OLD_VISITS + 1);
  });

  it('search pregnant visits', async () => {
    const options = {
      isPregnant : 1,
    };
    await Page.search(options);
    await Page.expectNumberOfGridRows(1);
  });

  it('search patient visits by service', async () => {
    const options = {
      service : 'Medecine Interne',
    };
    await Page.search(options);
    await Page.expectNumberOfGridRows(OLD_VISITS + 2);
  });

  it('search patient visits by ward', async () => {
    const options = {
      ward : 'Pavillon A',
    };
    await Page.search(options);
    await Page.expectNumberOfGridRows(1);
    options.ward = 'Pavillon B';
    await Page.search(options);
    await Page.expectNumberOfGridRows(0);
  });

  it('search patient visits', async () => {
    const options = {
      isHospitalized : 1,
      displayName : 'Test 2 Patient',
    };
    await Page.search(options);
    await Page.expectNumberOfGridRows(0);
  });
});
