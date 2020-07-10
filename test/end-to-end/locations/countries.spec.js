/* global element, by */

const FU = require('../shared/FormUtils');
const GU = require('../shared/GridUtils');
const helpers = require('../shared/helpers');
const components = require('../shared/components');
const GridRow = require('../shared/GridRow');

describe('Countries Management', () => {
  const path = '#!/locations/country';

  // navigate to the page before the test suite
  before(() => helpers.navigate(path));

  const country = { name : 'New Country' };
  const country2 = {
    name : 'another country',
  };

  const gridId = 'country-grid';
  const referenceLocation = 'République Démocratique du Congo';

  it('Merge country', async () => {
    // Prevent mixing with no country selected
    await element(by.css(`[data-method="merge"]`)).click();
    await components.notification.hasWarn();

    // Prevent mixing with less than two countries
    await GU.selectRow(gridId, 0);
    await element(by.css(`[data-method="merge"]`)).click();
    await components.notification.hasWarn();

    // Merging succes
    await GU.selectRow(gridId, 1);

    await element(by.css(`[data-method="merge"]`)).click();
    await element(by.css(`[data-reference="${referenceLocation}"]`)).click();

    await FU.buttons.submit();
    await components.notification.hasSuccess();
  });

  it('creates a new country', async () => {
    await FU.buttons.create();
    await components.inpuText.set('name', country.name);
    // submit the page to the server
    await FU.buttons.submit();

    await components.notification.hasSuccess();
  });

  it('edits a country', async () => {
    const menu = await openDropdownMenu(country.name);
    await menu.edit().click();

    // modify the country name
    await components.inpuText.set('name', 'Country Update');

    // submit the page to the server
    await FU.buttons.submit();
    await components.notification.hasSuccess();
  });

  it('creates another country', async () => {

    // switch to the create form
    await FU.buttons.create();

    await components.inpuText.set('name', country2.name);
    // submit the page to the server
    await FU.buttons.submit();
    // expect a nice validation message
    await components.notification.hasSuccess();
  });

  it('should delete the test country', async () => {
    // click the edit button
    const menu = await openDropdownMenu(country2.name);
    await menu.remove().click();
    await FU.buttons.submit();
    await components.notification.hasSuccess();
  });

  it('blocks invalid form submission with relevant error classes', async () => {
    // switch to the create form
    await FU.buttons.create();

    // submit the page to the server
    await FU.buttons.submit();
    // the following fields should be required
    await components.inpuText.validationError('name');
    await FU.buttons.cancel();

  });

  async function openDropdownMenu(label) {
    const row = new GridRow(label);
    await row.dropdown().click();
    return row;
  }

});
