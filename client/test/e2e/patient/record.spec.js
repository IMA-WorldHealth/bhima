/* jshint expr: true */
/* global element, by, browser */
const chai    = require('chai');
const expect  = chai.expect;

const components  = require('../shared/components');
const helpers     = require('../shared/helpers');
helpers.configure(chai);

describe('Patient Record', function () {

  const root = '#/patients/';
  const id = '274c51ae-efcc-4238-98c6-f402bfb39866';

  const patient = {
    name : 'Test Patient 2',
    id : 'TPA1',
    hospital_no : '110',
    age : '26',
    gender : 'M'
  };

  const path = root.concat(id);

  before(() => helpers.navigate(path));

  it('downloads and correctly displays patient information', function () {
    expect(element(by.id('name')).getText()).to.eventually.equal(patient.name);
    expect(element(by.id('patientID')).getText()).to.eventually.equal(patient.id);
    expect(element(by.id('hospitalNo')).getText()).to.eventually.equal(patient.hospital_no);
    expect(element(by.id('age')).getText()).to.eventually.equal(patient.age);
    expect(element(by.id('gender')).getText()).to.eventually.equal(patient.gender);
  });

  it('informs the user that there is no patient for invalid request', function () {
    helpers.navigate(root.concat('invalidid'));
    components.notification.hasError();
    expect(element(by.id('nopatient')).isPresent()).to.eventually.equal(true);
  });
});
