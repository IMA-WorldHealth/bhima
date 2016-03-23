/* jshint expr:true */
/* global element, by, beforeEach, inject, browser */

var chai = require('chai');
var expect = chai.expect;

var FU = require('../shared/FormUtils');
var helpers = require('../shared/helpers');
var components = require('../shared/components');

helpers.configure(chai);

describe('Locations /Sectors Management', function () {
  'use strict';

  var path = '#/locations/sector';

  var sector = {
    name : 'A Sector for Test'
  };

  var locations = {
    country : 'République Démocratique du Congo',
    province : 'BANDUNDU' 
  };

  var locationsUpdate = {
    country : 'République Démocratique du Congo',
    province : 'Bas Congo' 
  };

  var defaultSector   = 209;

  var sectorRank    = 1;

  // navigate to the employee module before each test
  beforeEach(function () {
    browser.get(path);
  });

  it('successfully creates a new Sector', function () {   
    // swtich to the create form
    FU.buttons.create();

    // select an Country
    element(by.model('SectorCtrl.sector.country_uuid')).element(by.cssContainingText('option', locations.country)).click();

    // select an Province
    element(by.model('SectorCtrl.sector.province_uuid')).element(by.cssContainingText('option', locations.province)).click();

    // Set the Sector Name
    FU.input('SectorCtrl.sector.name', sector.name);
  
    // submit the page to the server
    FU.buttons.submit();

    // expect a nice validation message
    FU.exists(by.id('create_success'), true);
  });

  it('successfully edits a Sector ', function () {
    element(by.id('sector-' + sectorRank )).click();

    // Update an Country
    element(by.model('SectorCtrl.sector.country_uuid')).element(by.cssContainingText('option', locationsUpdate.country)).click();

    // Update an Province
    element(by.model('SectorCtrl.sector.province_uuid')).element(by.cssContainingText('option', locationsUpdate.province)).click();

    // modify the Sector Name
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
