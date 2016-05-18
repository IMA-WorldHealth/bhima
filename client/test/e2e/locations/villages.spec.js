/* global element, by, browser */
const chai = require('chai');
const expect = chai.expect;

const FU = require('../shared/FormUtils');
const helpers = require('../shared/helpers');
helpers.configure(chai);

describe('Villages Management', function () {
  'use strict';

  const path = '#/locations/village';
  before(() => helpers.navigate(path));

  const village = {
    name : 'A Village for Test'
  };

  const locations = {
    country   : 'République Démocratique du Congo',
    province  : 'Kasai Occidental',
    sector    : 'Kananga'
  };

  const locationsUpdate = {
    country   : 'République Démocratique du Congo',
    province  : 'Bas Congo',
    sector    : 'Kimvula'
  };

  const defaultVillage = 201;
  const villageRank = helpers.random(defaultVillage);

  it('successfully creates a new village', function () {
    // switch to the create form
    FU.buttons.create();

    // select an country
    element(by.model('VillageCtrl.village.country_uuid')).element(by.cssContainingText('option', locations.country)).click();

    // select an province
    element(by.model('VillageCtrl.village.province_uuid')).element(by.cssContainingText('option', locations.province)).click();

    // select an sector
    element(by.model('VillageCtrl.village.sector_uuid')).element(by.cssContainingText('option', locations.sector)).click();

    // set village name
    FU.input('VillageCtrl.village.name', village.name);

    // submit the page to the server
    FU.buttons.submit();

    // expect a nice validation message
    FU.exists(by.id('create_success'), true);
  });

  it('successfully edits a village', function () {
    element(by.id('village-' + villageRank )).click();

    // update a country
    element(by.model('VillageCtrl.village.country_uuid')).element(by.cssContainingText('option', locationsUpdate.country)).click();

    // update an province
    element(by.model('VillageCtrl.village.province_uuid')).element(by.cssContainingText('option', locationsUpdate.province)).click();

    // update an sector
    element(by.model('VillageCtrl.village.sector_uuid')).element(by.cssContainingText('option', locationsUpdate.sector)).click();

    // modify the village name
    FU.input('VillageCtrl.village.name', 'Village Update');

    element(by.id('change_village')).click();

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
    FU.validation.error('VillageCtrl.village.country_uuid');
    FU.validation.error('VillageCtrl.village.province_uuid');
    FU.validation.error('VillageCtrl.village.sector_uuid');
    FU.validation.error('VillageCtrl.village.name');
  });
});
