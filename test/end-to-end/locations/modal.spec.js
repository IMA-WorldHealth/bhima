/* global element, by */
const FU = require('../shared/FormUtils');
const helpers = require('../shared/helpers');
const notification = require('../shared/components/notify');

describe('Locations (create modal)', () => {
  before(() => helpers.navigate('#!/patients/register'));

  const newLocation = {
    country  : 'Test Country 2',
    province : 'Test Province 2',
    sector   : 'Test Sector 2',
    village  : 'Test Village 2',
  };

  const selector = '[data-location-modal]';

  // switch to a certain view on the modal
  async function view(key) {
    const root = element(by.css(selector));

    // template in the target
    const target = `[data-location-view-key=${key}]`;

    // grab the correct button and click it
    const btn = root.element(by.css(target));
    await btn.click();
  }

  // open the modal
  async function open() {
    const _root = element(by.id('origin-location-id'));
    await _root.element(by.css('[data-location-modal-open]')).click();
  }

  // submit the modal
  async function submit() {
    const root = element(by.css(selector));
    const submitBtn = root.element(by.css('[type=submit]'));
    await submitBtn.click();
  }

  it('registers a new country', async () => {
    await open();

    // switch to the country view
    await view('country');

    // create a new country entity
    await FU.input('LocationModalCtrl.country', newLocation.country);

    // submit the country
    await submit();

    // it should close the modal
    await FU.exists(by.css(selector), false);

  });

  it('registers a new province', async () => {
    await open();

    await FU.exists(by.css(selector), true);

    // switch to the province view
    await view('province');

    // get the country select and select the previous country
    await FU.select('LocationModalCtrl.country', newLocation.country);
    await FU.input('LocationModalCtrl.province', newLocation.province);

    // submit the modal
    await submit();

    // it should close the modal
    await FU.exists(by.css(selector), false);
  });

  it('register a new sector', async () => {
    await open();

    await FU.exists(by.css(selector), true);

    // switch to the sector view
    await view('sector');

    await FU.select('LocationModalCtrl.country', newLocation.country);
    await FU.select('LocationModalCtrl.province', newLocation.province);
    await FU.input('LocationModalCtrl.sector', newLocation.sector);

    // submit the modal
    await submit();

    // it should close the modal
    await FU.exists(by.css(selector), false);
  });

  it('register a new village', async () => {
    await open();

    await FU.exists(by.css(selector), true);

    // switch to the village view
    await view('village');

    await FU.select('LocationModalCtrl.country', newLocation.country);
    await FU.select('LocationModalCtrl.province', newLocation.province);
    await FU.select('LocationModalCtrl.sector', newLocation.sector);
    await FU.input('LocationModalCtrl.village', newLocation.village);

    // submit the modal
    await submit();

    await notification.hasSuccess();

    // it should close the modal
    await FU.exists(by.css(selector), false);
  });
});
