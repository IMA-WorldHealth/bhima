const { expect } = require('chai');
const FU = require('../shared/FormUtils');
const helpers = require('../shared/helpers');
const components = require('../shared/components');
const GridRow = require('../shared/GridRow');

describe('Sectors Management', () => {
  before(() => helpers.navigate('#!/locations/sector'));

  const sector = {
    country : 'République Démocratique du Congo',
    province : 'Kinshasa',
    name : 'New Sector',
  };

  const sector2 = sector;
  sector2.name = 'test-sector';

  it('creates a new sector', async () => {
    // switch to the create form
    await FU.buttons.create();

    // select an country
    await FU.select('ModalCtrl.sector.country_uuid', sector.country);
    await FU.select('ModalCtrl.sector.province_uuid', sector.province);
    await FU.input('ModalCtrl.sector.name', sector.name);

    // submit the page to the server
    await FU.buttons.submit();

    await components.notification.hasSuccess();
  });

  it('edits a sector', async () => {
    const menu = await openDropdownMenu(sector.name);
    await menu.edit().click();

    await FU.select('ModalCtrl.sector.country_uuid', sector.country);
    await FU.select('ModalCtrl.sector.province_uuid', sector.province);
    await FU.input('ModalCtrl.sector.name', 'Sector Update');

    // submit the page to the server
    await FU.buttons.submit();

    // make sure the success message appears
    await components.notification.hasSuccess();
  });

  it('creates another sector', async () => {

    // switch to the create form
    await FU.buttons.create();

    await FU.select('ModalCtrl.sector.country_uuid', sector2.country);
    await FU.select('ModalCtrl.sector.province_uuid', sector2.province);
    await FU.input('ModalCtrl.sector.name', sector2.name);

    // submit the page to the server
    await FU.buttons.submit();

    // expect a nice validation message
    await components.notification.hasSuccess();
  });

  it('should delete the test sector', async () => {
    // click the edit button
    const menu = await openDropdownMenu(sector2.name);
    await menu.remove().click();

    await FU.buttons.submit();
    await components.notification.hasSuccess();
  });

  it('blocks invalid form submission with relevant error classes', async () => {
    // switch to the create form
    await FU.buttons.create();

    // Verify form has not been successfully submitted
    expect(await helpers.getCurrentPath()).to.equal('#!/locations/sector');

    // submit the page to the server
    await FU.buttons.submit();

    // the following fields should be required
    await FU.validation.error('ModalCtrl.sector.country_uuid');
    await FU.validation.error('ModalCtrl.sector.province_uuid');
    await FU.validation.error('ModalCtrl.sector.name');
    await FU.buttons.cancel();
  });

  async function openDropdownMenu(label) {
    const row = new GridRow(label);
    await row.dropdown().click();
    return row;
  }

});
