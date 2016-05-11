/* global element, by, inject, browser */

const chai = require('chai');
const expect = chai.expect;

const FU = require('../shared/FormUtils');
const helpers = require('../shared/helpers');
helpers.configure(chai);

describe('Provinces Management', function () {
  'use strict';

  const path = '#/locations/province';

  before(() => helpers.navigate(path));

  const province = {
    name : 'A Province for Test'
  };

  const defaultProvince = 14;
  const provinceRank  = 1;

  it('successfully creates a new province', function () {
    // switch to the create form
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

  it('successfully edits a province', function () {
    element(by.id('province-' + provinceRank)).click();

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

    // verify form has not been successfully submitted
    expect(helpers.getCurrentPath()).to.eventually.equal(path);

    // submit the page to the server
    FU.buttons.submit();

    // the following fields should be required
    FU.validation.error('ProvinceCtrl.province.country_uuid');
    FU.validation.error('ProvinceCtrl.province.name');
  });
});
