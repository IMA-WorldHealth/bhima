angular.module('bhima.services')
  .service('VoucherItemService', VoucherItemService);

VoucherItemService.$inject = [ 'uuid', 'bhConstants', 'util' ];

/**
 * @class VoucherItemService
 *
 * @description
 * This class implements the defaults for a patient invoice item.  The class is
 * instantiated with every row of the Patient Invoice module's grid.  It
 * implements the following convenience methods:
 *  1. validate() - sets the `_valid` and `_invalid` flags on the row
 *  2. configure() - sets up the row's inventory item reference
 */
function VoucherItemService(uuid, Constants, util) {

  // global variables
  var MIN_DECIMAL_VALUE = Constants.lengths.minDecimalValue;
  var MIN_PRECISION_VALUE = getDecimalPrecision(MIN_DECIMAL_VALUE);

  /**
   * @function getDecimalPrecision
   * @param {Number} value - a numeric value
   * @description
   * This function gets the precision (the number of values after the
   * decimal point) of a numeric value.
   * @private
   */
  function getDecimalPrecision(value) {
    var valueString = String(value);
    var decimalPart = valueString.split('.')[1] || [];
    return decimalPart.length;
  }

  /** @constructor */
  function VoucherItem(item) {
    this.debit = 0;
    this.credit = 0;
    this.uuid = uuid();

    // validation state
    this._valid = false;
    this._invalid = !this._valid;

    // this is set to true where the account_id is configured
    this._initialized = false;

    // this will be the error
    this._error = undefined;

    // the item is initialized with an object, immediately configure
    // based on that object
    if (item) {
      this.configure(item);
    }
  }

  /**
   * @method validate
   *
   * @description
   * Runs validation on the journal voucher item rows.  It performs the following checks:
   *  1) Has an account_id
   *  2) Has either a debit or a credit
   *  3) Has a debit or credit above the min
   *
   * It will set both the this._valid and this._error properties on itself
   */
  VoucherItem.prototype.validate = function validate() {
    var item = this;

    // checks that the row is initialised
    var initialized = angular.isDefined(item.account_id);

    var debitPrecision = getDecimalPrecision(item.debit);
    var creditPrecision = getDecimalPrecision(item.credit);

    // checks that the decimal precision is able to be stored in the database correctly
    var hasValidPrecision = (
      debitPrecision <= MIN_PRECISION_VALUE &&
      creditPrecision <= MIN_PRECISION_VALUE
    );

    // check that only one column - debit or credit is filled out
    var hasSingleNumericValue = util.xor(Boolean(item.debit), Boolean(item.credit));

    // check that the values are greater than zero
    var hasPositiveValues = (item.debit >= 0 && item.credit >= 0);

    // set the initialized property
    this._initialised = initialized;

    this._valid = initialized &&
      hasValidPrecision &&
      hasSingleNumericValue &&
      hasPositiveValues;

    this._invalid = !this._valid;

    // if invalid, set the error appropriately
    if (this._invalid) {

      if (!initialized) {
        this._error = 'FORM.ERRORS.NOT_INITIALIZED';
      } else if (!hasValidPrecision) {
        this._error = 'VOUCHERS.COMPLEX.ERROR_PRECISION';
      } else if (!hasSingleNumericValue) {
        this._error = 'VOUCHERS.COMPLEX.ERROR_AMOUNT';
      } else if (!hasPositiveValues) {
        this._error = 'VOUCHERS.COMPLEX.ERRORS_NEGATIVE_VALUES';
      }

    // if not invalid, remove the error message
    } else {
      this._error = '';
    }

    return this._valid;
  };

  /**
   * @method configure
   *
   * @description
   * This function configures the voucher form with an account selected from
   * the ui-select.
   */
  VoucherItem.prototype.configure = function configure(item) {
    this.account_id = item.account_id;
    this._initialized = true;

    if (angular.isDefined(item.debit)) {
      this.debit = item.debit;
    }

    if (angular.isDefined(item.credit)) {
      this.credit = item.credit;
    }

    if (angular.isDefined(item.entity)) {
      this.entity = item.entity;
    }

    if (angular.isDefined(item.reference)) {
      this.reference = item.reference;
    }
  };

  return VoucherItem;
}
