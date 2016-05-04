/* global element, by, inject, browser */
const chai = require('chai');
const expect = chai.expect;
const helpers = require('../shared/helpers');

helpers.configure(chai);

describe('Patient Registry UI Grid ', function () {
  'use strict';

  const path = '#/patients/registry';
  before(() => browser.get(path));

  it('grid should have 3 visible rows', function () {
    var defaultVisibleRowNumber = 3;
    var grid = element(by.id('patient-registry'));
    var rows = grid.element( by.css('.ui-grid-render-container-body')).all( by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index') );
    expect(rows.count()).to.eventually.be.equal(defaultVisibleRowNumber);
  });

});
