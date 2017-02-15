/* global element, by, browser */
const chai    = require('chai');
const expect  = chai.expect;
const path = require('path');

const components  = require('../shared/components');
const helpers     = require('../shared/helpers');
helpers.configure(chai);

const fixtures = path.resolve(__dirname, '../../fixtures/');

describe('Patient Record', function () {
  const root = '#/patients/';
  const id = '274c51ae-efcc-4238-98c6-f402bfb39866';

  before(() => helpers.navigate(root.concat(id)));

  it('uploads a patient picture', function () {
    const fileToUpload = 'patient.png';
    const absolutePath = path.resolve(fixtures, fileToUpload);

    element.all(by.css('input[type=file]')).get(0).sendKeys(absolutePath);
    components.notification.hasSuccess();
  });

  it('unable to upload a file that is not a picture', function () {
    const fileToUpload = 'sample.pdf';
    const absolutePath = path.resolve(fixtures, fileToUpload);

    element.all(by.css('input[type=file]')).get(0).sendKeys(absolutePath);
    components.notification.hasDanger();
  });
});
