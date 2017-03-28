/**
 * Component Test Wrappers
 *
 * This module exposes individual test wrappers for componets created in bhima.
 * The idea is to prevent collisions when updating or working on individual
 * component's tests suites.
 *
 * @module e2e/componets
 * @public
 */
'use strict';

module.exports = {
  currencySelect : require('./bhCurrencySelect'),
  locationSelect : require('./bhLocationSelect'),
  currencyInput  : require('./bhCurrencyInput'),
  findPatient    : require('./bhFindPatient'),
  dateEditor     : require('./bhDateEditor'),
  modalAction    : require('./bhModalAction'),
  notification   : require('./notify'),
  dateInterval   : require('./bhDateInterval'),
  accountSelect  : require('./bhAccountSelect'),
  depotDropdown  : require('./bhDepotDropdown'),
};
