/* jshint expr:true */
/* global element, by, beforeEach, inject, browser */

var chai = require('chai');
var expect = chai.expect;

var FU = require('../shared/FormUtils');
var helpers = require('../shared/helpers');

helpers.configure(chai);

describe('Locations Module', function () {
  'use strict';

  var path = '#/locations';

  var country = {
    name : 'A Country for Test'
  }; 

  var province = {
    name : 'A Province for Test'
  };

  var sector = {
    name : 'A Sector for Test'
  };

  var village = {
    name : 'A Village for Test'
  };

  var defaultCountry  = 242;
  var defaultProvince = 14;
  var defaultSector   = 209;
  var defaultVillage  = 201;

  var countryRank   = helpers.random(defaultCountry);
  var provinceRank  = helpers.random(defaultProvince);
  var sectorRank    = helpers.random(defaultSector);
  var villageRank   = helpers.random(defaultVillage);  

  // navigate to the employee module before each test
  beforeEach(function () {
    browser.get(path);
  });

  it('successfully creates a new Country', function () {
    element(by.id('country')).click();    
    // swtich to the create form
    FU.buttons.create();
    FU.input('CountryCtrl.country.name', country.name);
  
    // submit the page to the server
    FU.buttons.submit();

    // expect a nice validation message
    FU.exists(by.id('create_success'), true);
  });

  it('successfully creates a new Province', function () {
    element(by.id('province')).click();    
    // swtich to the create form
    FU.buttons.create();

    // select an Country
    FU.select('ProvinceCtrl.province.country_uuid')
      .enabled()
      .first()
      .click();

    FU.input('ProvinceCtrl.province.name', province.name);
  
    // submit the page to the server
    FU.buttons.submit();

    // expect a nice validation message
    FU.exists(by.id('create_success'), true);
  });

  it('successfully creates a new Sector', function () {
    element(by.id('sector')).click();    
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

  it('successfully creates a new Village', function () {
    element(by.id('village')).click();    
    // swtich to the create form
    FU.buttons.create();

    // select an Country
    FU.select('VillageCtrl.village.country_uuid')
      .enabled()
      .first()
      .click();

    // select an Province
    FU.select('VillageCtrl.village.province_uuid')
      .enabled()
      .first()
      .click();

    // select an Sector
    FU.select('VillageCtrl.village.sector_uuid')
      .enabled()
      .first()
      .click();

    FU.input('VillageCtrl.village.name', village.name);
  
    // submit the page to the server
    FU.buttons.submit();

    // expect a nice validation message
    FU.exists(by.id('create_success'), true);
  });

  it('successfully edits an Country ', function () {
    element(by.id('country')).click();
    element(by.id('country-' + countryRank )).click();

    // modify the Country Name
    FU.input('CountryCtrl.country.name', 'Republique Of');

    element(by.id('change_country')).click();

    // make sure the success message appears
    FU.exists(by.id('update_success'), true);
  });


  it('successfully edits an Province ', function () {
    element(by.id('province')).click();
    element(by.id('province-' + provinceRank )).click();

    // Update an Country
    FU.select('ProvinceCtrl.province.country_uuid')
      .enabled()
      .first()
      .click();

    // modify the Province Name
    FU.input('ProvinceCtrl.province.name', 'Province Update');

    element(by.id('change_province')).click();

    // make sure the success message appears
    FU.exists(by.id('update_success'), true);
  });

  it('successfully edits a Sector ', function () {
    element(by.id('sector')).click();
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

  it('successfully edits a Village ', function () {
    element(by.id('village')).click();
    element(by.id('village-' + villageRank )).click();

    // Update an Country
    FU.select('VillageCtrl.village.country_uuid')
      .enabled()
      .first()
      .click();

    // Update an Province
    FU.select('VillageCtrl.village.province_uuid')
      .enabled()
      .first()
      .click();

    // Update an Sector
    FU.select('VillageCtrl.village.sector_uuid')
      .enabled()
      .first()
      .click();

    // modify the Village Name
    FU.input('VillageCtrl.village.name', 'Village Update');

    element(by.id('change_village')).click();

    // make sure the success message appears
    FU.exists(by.id('update_success'), true);
  });

  it('correctly blocks invalid form submission with relevant error classes for Country', function () {
    element(by.id('country')).click();
    // switch to the create form
    element(by.id('create')).click();

    // Verify form has not been successfully submitted
    expect(browser.getCurrentUrl()).to.eventually.equal(browser.baseUrl + path + '/country');

    // submit the page to the server
    FU.buttons.submit();

    // the following fields should be required
    FU.validation.error('CountryCtrl.country.name');
  });

  it('correctly blocks invalid form submission with relevant error classes for Province', function () {
    element(by.id('province')).click();
    // switch to the create form
    element(by.id('create')).click();

    // Verify form has not been successfully submitted
    expect(browser.getCurrentUrl()).to.eventually.equal(browser.baseUrl + path + '/province');

    // submit the page to the server
    FU.buttons.submit();

    // the following fields should be required
    FU.validation.error('ProvinceCtrl.province.country_uuid');
    FU.validation.error('ProvinceCtrl.province.name');
  });

  it('correctly blocks invalid form submission with relevant error classes for Sector ', function () {
    element(by.id('sector')).click();
    // switch to the create form
    element(by.id('create')).click();

    // Verify form has not been successfully submitted
    expect(browser.getCurrentUrl()).to.eventually.equal(browser.baseUrl + path + '/sector');

    // submit the page to the server
    FU.buttons.submit();

    // the following fields should be required
    FU.validation.error('SectorCtrl.sector.country_uuid');
    FU.validation.error('SectorCtrl.sector.province_uuid');
    FU.validation.error('SectorCtrl.sector.name');
  });

  it('correctly blocks invalid form submission with relevant error classes for Village ', function () {
    element(by.id('village')).click();
    // switch to the create form
    element(by.id('create')).click();

    // Verify form has not been successfully submitted
    expect(browser.getCurrentUrl()).to.eventually.equal(browser.baseUrl + path + '/village');

    // submit the page to the server
    FU.buttons.submit();

    // the following fields should be required
    FU.validation.error('VillageCtrl.village.country_uuid');
    FU.validation.error('VillageCtrl.village.province_uuid');
    FU.validation.error('VillageCtrl.village.sector_uuid');
    FU.validation.error('VillageCtrl.village.name');
  });

});
