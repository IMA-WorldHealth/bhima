/* jshint expr:true */
/* global element, by, beforeEach, inject, browser */

var chai = require('chai');
var expect = chai.expect;

var FU = require('../shared/FormUtils');
var helpers = require('../shared/helpers');

helpers.configure(chai);

describe('Locations/Village Management', function () {
  'use strict';

  var path = '#/locations/village';

  var village = {
    name : 'A Village for Test'
  };

  var defaultVillage  = 201;

  var villageRank   = helpers.random(defaultVillage);  

  // navigate to the employee module before each test
  beforeEach(function () {
    browser.get(path);
  });

  it('successfully creates a new Village', function () {
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


  it('successfully edits a Village ', function () {
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


  it('correctly blocks invalid form submission with relevant error classes', function () {
    element(by.id('village')).click();
    // switch to the create form
    element(by.id('create')).click();

    // Verify form has not been successfully submitted
    expect(browser.getCurrentUrl()).to.eventually.equal(browser.baseUrl + path);

    // submit the page to the server
    FU.buttons.submit();

    // the following fields should be required
    FU.validation.error('VillageCtrl.village.country_uuid');
    FU.validation.error('VillageCtrl.village.province_uuid');
    FU.validation.error('VillageCtrl.village.sector_uuid');
    FU.validation.error('VillageCtrl.village.name');
  });

});
