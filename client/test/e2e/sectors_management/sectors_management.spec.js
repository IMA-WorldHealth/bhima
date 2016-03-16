/* jshint expr:true */
/* global element, by, beforeEach, inject, browser */

var chai = require('chai');
var expect = chai.expect;

var FU = require('../shared/FormUtils');
var helpers = require('../shared/helpers');

helpers.configure(chai);

describe('Locations Module', function () {
  'use strict';

  var path = '#/locations/sector';

  var sector = {
    name : 'A Sector for Test'
  };

  var defaultSector   = 209;

  var sectorRank    = helpers.random(defaultSector);

  // navigate to the employee module before each test
  beforeEach(function () {
    browser.get(path);
  });

  it('successfully creates a new Sector', function () {   
    // swtich to the create form
    FU.buttons.create();

    // select an Country
    FU.select('SectorCtrl.sector.country_uuid')
      .enabled()
      .first()
      .click();

    // select an Province
    FU.select('SectorCtrl.sector.province_uuid')
      .enabled()
      .first()
      .click();

    FU.input('SectorCtrl.sector.name', sector.name);
  
    // submit the page to the server
    FU.buttons.submit();

    // expect a nice validation message
    FU.exists(by.id('create_success'), true);
  });

  it('successfully edits a Sector ', function () {
    element(by.id('sector-' + sectorRank )).click();

    // Update an Country
    FU.select('SectorCtrl.sector.country_uuid')
      .enabled()
      .first()
      .click();

    // Update an Province
    FU.select('SectorCtrl.sector.province_uuid')
      .enabled()
      .first()
      .click();

    // modify the Province Name
    FU.input('SectorCtrl.sector.name', 'Sector Update');

    element(by.id('change_sector')).click();

    // make sure the success message appears
    FU.exists(by.id('update_success'), true);
  });


  it('correctly blocks invalid form submission with relevant error classes', function () {
    // switch to the create form
    element(by.id('create')).click();

    // Verify form has not been successfully submitted
    expect(browser.getCurrentUrl()).to.eventually.equal(browser.baseUrl + path);

    // submit the page to the server
    FU.buttons.submit();

    // the following fields should be required
    FU.validation.error('SectorCtrl.sector.country_uuid');
    FU.validation.error('SectorCtrl.sector.province_uuid');
    FU.validation.error('SectorCtrl.sector.name');
  });

});
