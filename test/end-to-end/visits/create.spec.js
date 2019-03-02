/* global */
const chai = require('chai');

const helpers = require('../shared/helpers');

helpers.configure(chai);

const ServicePage = require('./create.page');

describe.only('Patient Visits', () => {
  const path = '#!/patients/visits';
  beforeEach(() => helpers.navigate(path));

  const Page = new ServicePage();

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
});
