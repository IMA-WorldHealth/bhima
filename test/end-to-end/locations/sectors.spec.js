/* global by */

const { expect } = require('chai');
const FU = require('../shared/FormUtils');
const helpers = require('../shared/helpers');

describe('Sectors Management', () => {

  before(() => helpers.navigate('#!/locations/sector'));

  const sector = {
    country : 'République Démocratique du Congo',
    province : 'Kinshasa',
    name : 'New Sector',
  };

  it('creates a new sector', () => {
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

  it('edits a sector', () => {
    $(`[data-sector-name="${sector.name}"]`).click();

    FU.select('SectorCtrl.sector.country_uuid', sector.country);
    FU.select('SectorCtrl.sector.province_uuid', sector.province);
    FU.input('SectorCtrl.sector.name', 'Sector Update');

    // submit the page to the server
    FU.buttons.submit();

    // make sure the success message appears
    FU.exists(by.id('update_success'), true);
  });

  it('blocks invalid form submission with relevant error classes', () => {
    // switch to the create form
    FU.buttons.create();

    // Verify form has not been successfully submitted
    expect(helpers.getCurrentPath()).to.eventually.equal('#!/locations/sector');

    // submit the page to the server
    FU.buttons.submit();

    // the following fields should be required
    FU.validation.error('SectorCtrl.sector.country_uuid');
    FU.validation.error('SectorCtrl.sector.province_uuid');
    FU.validation.error('SectorCtrl.sector.name');
  });
});
