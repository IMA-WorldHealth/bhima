/* global element, by, browser */
const chai = require('chai');
const expect = chai.expect;

const FU = require('../shared/FormUtils');
const helpers = require('../shared/helpers');
helpers.configure(chai);

describe('Sectors Management', function () {
  'use strict';

  before(() => helpers.navigate('#/locations/sector'));

  const sector = {
    country :'Test Hook Country',
    province : 'Test Hook Province',
    name : 'New Sector'
  };

  it('creates a new sector', function () {
    // switch to the create form
    FU.buttons.create();

    // select an country
    FU.select('SectorCtrl.sector.country_uuid', sector.country);
    FU.select('SectorCtrl.sector.province_uuid', sector.province);
    FU.input('SectorCtrl.sector.name', sector.name);

    // submit the page to the server
    FU.buttons.submit();

    // expect a nice validation message
    FU.exists(by.id('create_success'), true);
  });

  it('edits a sector', function () {
    $(`[data-sector-name="${sector.name}"]`).click();

    FU.select('SectorCtrl.sector.country_uuid', sector.country);
    FU.select('SectorCtrl.sector.province_uuid', sector.province);
    FU.input('SectorCtrl.sector.name', 'Sector Update');

    element(by.id('change_sector')).click();

    // make sure the success message appears
    FU.exists(by.id('update_success'), true);
  });

  it('blocks invalid form submission with relevant error classes', function () {
    // switch to the create form
    element(by.id('create')).click();

    // Verify form has not been successfully submitted
    expect(helpers.getCurrentPath()).to.eventually.equal('#/locations/sector');

    // submit the page to the server
    FU.buttons.submit();

    // the following fields should be required
    FU.validation.error('SectorCtrl.sector.country_uuid');
    FU.validation.error('SectorCtrl.sector.province_uuid');
    FU.validation.error('SectorCtrl.sector.name');
  });
});
