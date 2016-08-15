/* global element, by, browser */
const FU = require('../shared/FormUtils');
const helpers = require('../shared/helpers');

describe('locations (create modal)', function () {
  'use strict';

  before(() => helpers.navigate('#/patients/register'));

  /** location to be created */
  var newLocation = {
    country:  'Test Country 2',
    province: 'Test Province 2',
    sector:   'Test Sector 2',
    village:  'Test Village 2'
  };

  var selector = '[data-location-modal]';
  var link = '#origin-location-id [data-location-modal-open]';

  // switch to a certain view on the modal
  function view(key) {
    var root = element(by.css(selector));

    // template in the target
    var target = `[data-location-view-key=${key}]`;

    // grab the correct button and click it
    var btn = root.element(by.css(target));
    btn.click();
  }

  // open the modal
  function open() {
    element(by.css(link)).click();
  }

  // submit the modal
  function submit() {
    var root = element(by.css(selector));
    var submit = root.element(by.css('[type=submit]'));
    submit.click();
  }

  it('registers a new country', function () {
    open();

    // switch to the country view
    view('country');

    // create a new country entity
    FU.input('LocationModalCtrl.country', newLocation.country);

    // submit the country
    submit();

    // it should close the modal
    FU.exists(by.css(selector), false);
  });

  it('registers a new province', function () {
    open();

    FU.exists(by.css(selector), true);

    // switch to the province view
    view('province');

    // get the country select and select the previous country
    FU.select('LocationModalCtrl.country', newLocation.country);
    FU.input('LocationModalCtrl.province', newLocation.province);

    // submit the modal
    submit();

    // it should close the modal
    FU.exists(by.css(selector), false);
  });

  it('register a new sector', function () {
    open();

    FU.exists(by.css(selector), true);

    // switch to the sector view
    view('sector');

    FU.select('LocationModalCtrl.country', newLocation.country);
    FU.select('LocationModalCtrl.province', newLocation.province);
    FU.input('LocationModalCtrl.sector', newLocation.sector);

    // submit the modal
    submit();

    // it should close the modal
    FU.exists(by.css(selector), false);
  });

  it('register a new village', function () {
    open();

    FU.exists(by.css(selector), true);

    // switch to the village view
    view('village');

    FU.select('LocationModalCtrl.country', newLocation.country);
    FU.select('LocationModalCtrl.province', newLocation.province);
    FU.select('LocationModalCtrl.sector', newLocation.sector);
    FU.input('LocationModalCtrl.village', newLocation.village);

    // submit the modal
    submit();

    // it should close the modal
    FU.exists(by.css(selector), false);
  });
});
