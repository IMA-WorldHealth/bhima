/* global element, by, browser */
const chai = require('chai');
const expect = chai.expect;

const FU = require('../shared/FormUtils');
const helpers = require('../shared/helpers');
helpers.configure(chai);

describe('Villages Management', function () {
  'use strict';

  const path = '#!/locations/village';
  before(() => helpers.navigate(path));

  const village = {
    country: 'Democratiq Republic of Congo',
    province: 'Bas Congo',
    sector: 'Tshikapa',
    name: 'New Village'
  };

  it('creates a new village', function () {

    // switch to the create form
    FU.buttons.create();

    FU.select('VillageCtrl.village.country_uuid', village.country);
    FU.select('VillageCtrl.village.province_uuid', village.province);
    FU.select('VillageCtrl.village.sector_uuid', village.sector);
    FU.input('VillageCtrl.village.name', village.name);

    // submit the page to the server
    FU.buttons.submit();

    // expect a nice validation message
    FU.exists(by.id('create_success'), true);
  });

  it('edits a village', function () {

    // click the edit button
    $(`[data-village-name="${village.name}"]`).click();

    // update a country
    FU.select('VillageCtrl.village.country_uuid', village.country);
    FU.select('VillageCtrl.village.province_uuid', village.province);
    FU.select('VillageCtrl.village.sector_uuid', village.sector);
    FU.input('VillageCtrl.village.name', 'Village Update');

    element(by.id('change_village')).click();

    // make sure the success message appears
    FU.exists(by.id('update_success'), true);
  });

  it('correctly blocks invalid form submission with relevant error classes', function () {

    // switch to the create form
    FU.buttons.create();

    // verify form has not been submitted
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
