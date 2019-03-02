/* global */
const chai = require('chai');

const helpers = require('../shared/helpers');

helpers.configure(chai);

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
    patient : 'Test 1 Patient', // a female patient
    service : 'Medecine Interne',
    note : 'Femme enceint',
    ward : 'Pavillon A',
    room : 'Room A in Ward A',
  };

  it('successfully creates a new visit', () => {
    Page.createVisitSuccess(
      defaultVisit.patient,
      defaultVisit.service,
      defaultVisit.diagnosis,
      defaultVisit.note
    );
  });

  it('forbid to create a new visit for a pending patient', () => {
    Page.createVisitFail(
      defaultVisit.patient,
      defaultVisit.service,
      defaultVisit.diagnosis,
      defaultVisit.note
    );
  });

  it('successfully creates a new hospitalization visit', () => {
    Page.createVisitSuccess(
      hospiVisit.patient,
      hospiVisit.service,
      hospiVisit.diagnosis,
      hospiVisit.note,
      true, true, true, true, true,
      hospiVisit.ward,
      hospiVisit.room
    );
  });

  it('counts visits in the registry', () => {
    Page.expectNumberOfGridRows(2);
  });

  it('search only hospitalized patients', () => {
    const options = {
      isHospitalized : 1,
    };
    Page.search(options);
    Page.expectNumberOfGridRows(1);
  });

  it('search by patient name', () => {
    const options = {
      displayName : 'Test 2 Patient',
    };
    Page.search(options);
    Page.expectNumberOfGridRows(1);
  });

  it('search pregnant visits', () => {
    const options = {
      isPregnant : 1,
    };
    Page.search(options);
    Page.expectNumberOfGridRows(1);
  });

  it('search patient visits by service', () => {
    const options = {
      service : 'Medecine Interne',
    };
    Page.search(options);
    Page.expectNumberOfGridRows(2);
  });

  it('search patient visits by ward', () => {
    const options = {
      ward : 'Pavillon A',
    };
    Page.search(options);
    Page.expectNumberOfGridRows(1);
    options.ward = 'Pavillon B';
    Page.search(options);
    Page.expectNumberOfGridRows(0);
  });

  it('search patient visits', () => {
    const options = {
      isHospitalized : 1,
      displayName : 'Test 2 Patient',
    };
    Page.search(options);
    Page.expectNumberOfGridRows(0);
  });
});
