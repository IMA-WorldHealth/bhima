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

  it('creates a new sector', async () => {
    // switch to the create form
    await FU.buttons.create();

    // select an country
    await FU.select('SectorCtrl.sector.country_uuid', sector.country);
    await FU.select('SectorCtrl.sector.province_uuid', sector.province);
    await FU.input('SectorCtrl.sector.name', sector.name);

    // submit the page to the server
    await FU.buttons.submit();

    // expect a nice validation message
    await FU.exists(by.id('create_success'), true);
  });

  it('edits a sector', async () => {
    await $(`[data-sector-name="${sector.name}"]`).click();

    await FU.select('SectorCtrl.sector.country_uuid', sector.country);
    await FU.select('SectorCtrl.sector.province_uuid', sector.province);
    await FU.input('SectorCtrl.sector.name', 'Sector Update');

    // submit the page to the server
    await FU.buttons.submit();

    // make sure the success message appears
    await FU.exists(by.id('update_success'), true);
  });

  it('blocks invalid form submission with relevant error classes', async () => {
    // switch to the create form
    await FU.buttons.create();

    // Verify form has not been successfully submitted
    expect(await helpers.getCurrentPath()).to.eventually.equal('#!/locations/sector');

    // submit the page to the server
    await FU.buttons.submit();

    // the following fields should be required
    await FU.validation.error('SectorCtrl.sector.country_uuid');
    await FU.validation.error('SectorCtrl.sector.province_uuid');
    await FU.validation.error('SectorCtrl.sector.name');
  });
});
