/* jshint expr: true */
/* global element, by, browser */
const chai    = require('chai');
const expect  = chai.expect;
const paths = require('path');

const components  = require('../shared/components');
const helpers     = require('../shared/helpers');
helpers.configure(chai);

describe('Patient Record', function () {
  const root = '#/patients/';
  const id = '274c51ae-efcc-4238-98c6-f402bfb39866';


  const path = root.concat(id);
  before(() => helpers.navigate(path));

  it('Upload a patient Picture', function () {
    var fileToUpload = '../../../../server/test/api/data/patient.png',
      absolutePath = paths.resolve(__dirname, fileToUpload);
    
    element.all(by.css('input[type=file]')).get(0).sendKeys(absolutePath);
    components.notification.hasSuccess();
  });

  it('Unable to Upload a file who aren\'t a picture', function () {
    var fileToUpload = '../../../../server/test/api/data/sample.pdf',
      absolutePath = paths.resolve(__dirname, fileToUpload);
    
    element.all(by.css('input[type=file]')).get(0).sendKeys(absolutePath);
    components.notification.hasDanger();
  });

});
