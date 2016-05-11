/* jshint expr: true */
/* global element, by, browser */
const chai = require('chai');
const expect = chai.expect;

const FU = require('../shared/FormUtils');
const components = require('../shared/components');
const helpers = require('../shared/helpers');
helpers.configure(chai);

describe('Patient Record', function () {

  const root = '#/patients/';
  const id = '274c51ae-efcc-4238-98c6-f402bfb39866';

  const path = root.concat(id);

  it.skip('downloads and correctly displays patient information', function () {
    /** @todo */
  });
});

