/* jshint expr:true */
/* global element, by, beforeEach, inject, browser */

var chai = require('chai');
var expect = chai.expect;

var FU = require('../shared/FormUtils');
var helpers = require('../shared/helpers');

helpers.configure(chai);

describe('Locations/Country Management', function () {
  'use strict';

  var path = '#/locations/country';

  var country = {
    name : 'A Country for Test'
  }; 

  var defaultCountry  = 242;
  var countryRank   = helpers.random(defaultCountry);

  // navigate to the employee module before each test
  beforeEach(function () {
    browser.get(path);
  });

  it('successfully creates a new Country', function () {
    // swtich to the create form
    FU.buttons.create();
    FU.input('CountryCtrl.country.name', country.name);
    // submit the page to the server
    FU.buttons.submit();
    // expect a nice validation message
    FU.exists(by.id('create_success'), true);
  });


  it('successfully edits an Country ', function () {
    element(by.id('country-' + countryRank )).click();
    // modify the Country Name
    FU.input('CountryCtrl.country.name', 'Republique Of');
    element(by.id('change_country')).click();
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
    FU.validation.error('CountryCtrl.country.name');
  });

});
