
const { test, expect } = require('@playwright/test');
const TU = require('../shared/TestUtils');
const notification = require('../shared/components/notify');

test.describe('Locations (create patient modal)', () => {
  const path = '#!/patients/register';

  test.beforeEach(async ({ page }) => {
    TU.registerPage(page);
    await TU.login();
    await TU.navigate(path);
  });

  const newLocation = {
    country  : 'Test Country 2',
    province : 'Test Province 2',
    sector   : 'Test Sector 2',
    village  : 'Test Village 2',
  };

  const selector = '#origin-location-id';

  // open the modal
  async function open() {
    const openBtn = await TU.locator(`${selector} [data-location-modal-open]`);
    return openBtn.click();
  }

  // switch to a certain view on the modal
  async function view(key) {
    // Click on the correct tab button
    const btn = await TU.locator(`[data-location-view-key=${key}]`);
    return btn.click();
  }

  // submit the modal
  async function submit() {
    const submitBtn = await TU.locator(`form[name=LocationModalForm] [type=submit]`);
    return submitBtn.click();
  }

  test('registers a new country', async () => {
    await open();

    // switch to the country view
    await view('country');

    // create a new country entity
    await TU.input('LocationModalCtrl.country', newLocation.country);

    // submit the country
    await submit();
    await notification.hasSuccess();

    // it should close the modal
    await TU.exists('[data-location-modal]', false);
  });

  test('registers a new province', async () => {
    await open();

    // switch to the province view
    await view('province');

    // get the country select and select the previous country
    await TU.select('LocationModalCtrl.country', newLocation.country);
    await TU.input('LocationModalCtrl.province', newLocation.province);

    // submit the modal
    await submit();
    await notification.hasSuccess();

    // it should close the modal
    await TU.exists('[data-location-modal]', false);
  });

  test('register a new sector', async () => {
    await open();

    // switch to the sector view
    await view('sector');

    await TU.select('LocationModalCtrl.country', newLocation.country);
    await TU.select('LocationModalCtrl.province', newLocation.province);
    await TU.input('LocationModalCtrl.sector', newLocation.sector);

    // submit the modal
    await submit();
    await notification.hasSuccess();

    // it should close the modal
    await TU.exists('[data-location-modal]', false);
  });

  test('register a new village', async () => {
    await open();

    // switch to the village view
    await view('village');

    await TU.select('LocationModalCtrl.country', newLocation.country);
    await TU.select('LocationModalCtrl.province', newLocation.province);
    await TU.select('LocationModalCtrl.sector', newLocation.sector);
    await TU.input('LocationModalCtrl.village', newLocation.village);

    // submit the modal
    await submit();
    await notification.hasSuccess();

    // it should close the modal
    await TU.exists('[data-location-modal]', false);
  });

});
