angular.module('bhima.services')
  .service('StockEntryModalForm', StockEntryModalForm);

StockEntryModalForm.$inject = ['uuid'];

/**
 * @function StockEntryModalForm
 *
 * @description
 * This function creates new instances of the StockForm used for registering
 * new lots during stock entry.  It also encapsulates the business logic for
 * validation of lots, as well as removal or addition of new ones.
 */
function StockEntryModalForm(uuid) {
  const ERR_NO_ROWS = 'STOCK.ERRORS.NO_ROWS';
  const ERR_LOT_QUANTITY_OVER_GLOBAL = 'STOCK.ERRORS.LOT_QUANTITY_OVER_GLOBAL';
  const ERR_INVALID_QUANTITY = 'STOCK.ERRORS.INVALID_LOT_QUANTITY';
  const ERR_INVALID_EXPIRATION = 'STOCK.ERRORS.INVALID_LOT_EXPIRATION';
  const ERR_INVALID_IDENTIFIER = 'STOCK.ERRORS.MISSING_LOT_NAME';

  function Lot(row = {}) {
    this.expiration_date = row.expiration_date || new Date();
    this.unit_cost = row.unit_cost || null;
    this.quantity = row.quantity || 1;
    this.lot = row.lot || null;
    this.isInvalid = true;
    this.isValid = false;
    this.identifier = uuid();

    if (row.uuid) {
      this.uuid = row.uuid;
    }
  }

  function StockForm(opts = {}) {
    this.rows = [];
    this.opts = opts;

    if (opts.rows) {
      this.rows = opts.rows.map(row => new Lot(row));
      this.validate();
    }
  }

  StockForm.prototype.addItem = function addItem() {
    const lot = new Lot();
    this.rows.push(lot);
    return lot;
  };

  StockForm.prototype.setMaxQuantity = function setMaxQuantity(value) {
    this.opts.max_quantity = value;
  };

  StockForm.prototype.removeItem = function removeItem(idx) {
    this.rows.splice(idx, 1);
  };

  /**
   * @function total
   *
   * @description
   * This function computes the total quantity in the form.
   */
  StockForm.prototype.total = function total() {
    return this.rows.reduce((sum, lot) => sum + lot.quantity, 0);
  };

  /**
   * @function validateSingleRow
   *
   * @description
   * This function takes in a single row and runs validation against it.
   */
  function validateSingleRow(row) {
    let hasFutureExpirationDate = new Date(row.expiration_date) >= new Date();
    row._error = null;

    // if the stock does not expire/have an expiration date, generate a fake one
    if (!this.opts.expires) {
      hasFutureExpirationDate = true;
      row.expiration_date = new Date((new Date().getFullYear() + 1000), new Date().getMonth());
    }
    // check invalid lot expiration date
    const hasInvalidExpiration = (!row.expiration_date || !hasFutureExpirationDate);
    if (hasInvalidExpiration) {
      row._error = ERR_INVALID_EXPIRATION;
    }

    // check invalid lot quantity
    if (row.quantity <= 0) {
      row._error = ERR_INVALID_QUANTITY;
    }

    // check missing lot identifier
    if (!row.lot) {
      row._error = ERR_INVALID_IDENTIFIER;
    }

    row.isInvalid = row._error != null;
    row.isValid = !row.isInvalid;
  }

  function validateAllRows() {
    const errors = [];

    if (this.rows.length === 0) {
      errors.push(ERR_NO_ROWS);
    }

    if (this.opts.max_quantity < this.total()) {
      errors.push(ERR_LOT_QUANTITY_OVER_GLOBAL);
    }

    this.rows.forEach(lot => {
      validateSingleRow.call(this, lot);

      if (lot.isInvalid) {
        errors.push(lot._error);
      }
    });

    // return unique errors
    return errors
      .filter((err, idx, arr) => arr.indexOf(err) === idx);
  }

  StockForm.prototype.validate = function validate(row) {
    const validationFn = angular.isDefined(row) ? validateSingleRow : validateAllRows;
    return validationFn.call(this, row);
  };

  return StockForm;
}
