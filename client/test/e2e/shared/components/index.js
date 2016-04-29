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
module.exports = {
  locationSelect:  require('./bhLocationSelect'),
  currencyInput:   require('./bhCurrencyInput'),
  findPatient:     require('./bhFindPatient'),
  findDebtorGroup: require('./bhFindDebtorGroup'),
  dateEditor:      require('./bhDateEditor'),
  modalAction:     require('./bhModalAction'),
  notification:    require('./notify')
};



