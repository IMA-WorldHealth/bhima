/* global element, by, browser */
const chai = require('chai');
const expect = chai.expect;

const FU = require('../shared/FormUtils');
const helpers = require('../shared/helpers');
helpers.configure(chai);

describe('locations (create modal)', function () {
  'use strict';

  before(() => helpers.navigate('#/patients/register'));

  /** location to be created */
  var newLocation = {
    country:  'Test Country',
    province: 'Test Province',
    sector:   'Test Sector',
    village:  'Test Village'
  };

  var selector = '[data-location-modal]';
  var link = '#origin-location-id [data-location-modal-open]';

  // switch to a certain view on the modal
  function view(key) {
    var root = element(by.css(selector));

    // template in the target
    var target = '[data-location-view-key=?]'.replace('?', key);

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

  it('will register a new country', function () {

    open();

    // switch to the country view
    view('country');

    // get the root of the modal
    var root = element(by.css(selector));

    // create a new country entity
    var country = root.element(by.model('LocationModalCtrl.country'));
    country.sendKeys(newLocation.country);

    // submit the country
    submit();

    // it should close the modal
    FU.exists(by.css(selector), false);
  });

  it('will register a new province', function () {

    open();

    FU.exists(by.css(selector), true);

    // switch to the province view
    view('province');

    // get the root of the modal
    var root = element(by.css(selector));

    // get the country select and select the previous country
    var country = root.element(by.model('LocationModalCtrl.country'));
    country.element(by.cssContainingText('option', newLocation.country)).click();

    // create a new province
    var province = root.element(by.model('LocationModalCtrl.province'));
    province.sendKeys(newLocation.province);

    // submit the modal
    submit();

    // it should close the modal
    FU.exists(by.css(selector), false);
  });

  it('will register a new sector', function () {

    open();

    FU.exists(by.css(selector), true);

    // switch to the sector view
    view('sector');

    // get the root of the modal
    var root = element(by.css(selector));

    // get the country select and select the previous country
    var country = root.element(by.model('LocationModalCtrl.country'));
    country.element(by.cssContainingText('option', newLocation.country)).click();

    // get the province select and select the previous province
    var province = element(by.model('LocationModalCtrl.province'));
    province.element(by.cssContainingText('option', newLocation.province)).click();

    // create a new sector
    var sector = root.element(by.model('LocationModalCtrl.sector'));
    sector.sendKeys(newLocation.sector);

    // submit the modal
    submit();

    // it should close the modal
    FU.exists(by.css(selector), false);
  });

  it('will register a new village', function () {

    open();

    FU.exists(by.css(selector), true);

    // switch to the village view
    view('village');

    // get the root of the modal
    var root = element(by.css(selector));

    // get the country select and select the previous country
    var country = root.element(by.model('LocationModalCtrl.country'));
    country.element(by.cssContainingText('option', newLocation.country)).click();

    // get the province select and select the previous province
    var province = root.element(by.model('LocationModalCtrl.province'));
    province.element(by.cssContainingText('option', newLocation.province)).click();

    // get the sector select and select the previous sector
    var sector = root.element(by.model('LocationModalCtrl.sector'));
    sector.element(by.cssContainingText('option', newLocation.sector)).click();

    // create a new village
    var village = element(by.model('LocationModalCtrl.village'));
    village.sendKeys(newLocation.village);

    // submit the modal
    submit();

    // it should close the modal
    FU.exists(by.css(selector), false);
  });
});


