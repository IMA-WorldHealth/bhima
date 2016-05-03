/* global element, by, inject, browser */
const chai = require('chai');
const expect = chai.expect;

const FU = require('../shared/FormUtils');
const helpers = require('../shared/helpers');
const components = require('../shared/components');
const gridTestUtils = require('../shared/gridTestUtils.spec.js');

helpers.configure(chai);

describe('Research Patient UI Grid ', function () {
  'use strict';

  const path = '#/patients/search';
  before(() => browser.get(path));

  it('grid should have three visible rows', function () {
    var defaultVisibleRowNumber = 3;

    GridObjectTest.expectRowCount(defaultVisibleRowNumber);

  });

});
