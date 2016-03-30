/* jshint expr:true */
/* global element, by, beforeEach, inject, browser */

var chai = require('chai');
var expect = chai.expect;

var FU = require('../shared/FormUtils');
var helpers = require('../shared/helpers');

helpers.configure(chai);

describe('Locations/Provinces Management', function () {
  'use strict';

  var path = '#/locations/province';

  var province = {
    name : 'A Province for Test'
  };

  var defaultProvince = 14;
  var provinceRank  = 1;

  // navigate to the employee module before each test
  beforeEach(function () {
    browser.get(path);
  });

  it('successfully creates a new Province', function () {
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

  it('successfully edits an Province ', function () {
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

  it('correctly blocks invalid form submission with relevant error classes', function () {
    // switch to the create form
    element(by.id('create')).click();

    // Verify form has not been successfully submitted
    expect(browser.getCurrentUrl()).to.eventually.equal(browser.baseUrl + path );

    // submit the page to the server
    FU.buttons.submit();

    // the following fields should be required
    FU.validation.error('ProvinceCtrl.province.country_uuid');
    FU.validation.error('ProvinceCtrl.province.name');
  });

});
