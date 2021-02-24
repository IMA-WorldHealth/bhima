angular.module('bhima.services')
  .service('AggregateConsumptionModalForm', AggregateConsumptionModalForm);

AggregateConsumptionModalForm.$inject = ['uuid'];

/**
 * @function AggregateConsumptionModalForm
 *
 * @description
 * This function allows you to create a new instance to record
 * the aggregate consumption of a batch by date. This function makes it possible to better track
 * consumption to quickly detect periods of out of stock
 */
function AggregateConsumptionModalForm(uuid) {
  const ERR_NO_ROWS = 'STOCK.ERRORS.NO_ROWS';
  const ERR_QUANTITY_CONSUMED_OVER_GLOBAL = 'STOCK.ERRORS.QUANTITY_CONSUMED_OVER_GLOBAL';
  const ERR_QUANTITY_LOST_OVER_GLOBAL = 'STOCK.ERRORS.QUANTITY_LOST_OVER_GLOBAL';
  const ERR_MISSING_LOT_UNIT_COST = 'STOCK.ERRORS.MISSING_LOT_UNIT_COST';
  const ERR_INVALID_QUANTITY_NEGATIVE = 'STOCK.ERRORS.INVALID_QUANTITY_NEGATIVE';
  const ERR_INVALID_PERIOD = 'STOCK.ERRORS.INVALID_PERIOD';
  const ERR_QUANTITY_CONSUMED_LOWER = 'STOCK.ERRORS.QUANTITY_CONSUMED_LOWER';
  const ERR_QUANTITY_LOST_LOWER = 'STOCK.ERRORS.QUANTITY_LOST_LOWER';

  function Lot(row = {}) {
    this.end_date = new Date(row.end_date) || new Date();
    this.unit_cost = row.unit_cost || null;
    this.quantity_consumed = row.quantity_consumed || 0;
    this.quantity_lost = row.quantity_lost || 0;
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
    this.unit_cost = opts.unit_cost || 0.0;

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

  StockForm.prototype.setMaxQuantityConsumed = function setMaxQuantityConsumed(value) {
    this.opts.max_quantity_consumed = value;
  };

  StockForm.prototype.setMaxQuantityLost = function setMaxQuantityLost(value) {
    this.opts.max_quantity_lost = value;
  };

  StockForm.prototype.setUnitCost = function setUnitCost(value) {
    this.unit_cost = value;
  };

  StockForm.prototype.removeItem = function removeItem(idx) {
    this.rows.splice(idx, 1);
  };

  /**
   * @function totalConsumed
   *
   * @description
   * This function computes the total quantity consumed in the form.
   */
  StockForm.prototype.totalConsumed = function totalConsumed() {
    return this.rows.reduce((sum, row) => sum + row.quantity_consumed, 0);
  };

  /**
   * @function totalLost
   *
   * @description
   * This function computes the total quantity lost in the form.
   */
  StockForm.prototype.totalLost = function totalLost() {
    return this.rows.reduce((sum, row) => sum + row.quantity_lost, 0);
  };

  /**
   * @function validateSingleRow
   *
   * @description
   * This function takes in a single row and runs validation against it.
   */
  function validateSingleRow(row) {

    const isInTheRightPeriod = new Date(row.end_date) >= new Date(this.opts.start_date)
      && new Date(row.end_date) <= new Date(this.opts.end_date);
    row._error = null;

    // check invalid lot expiration date
    if (!isInTheRightPeriod) {
      row._error = ERR_INVALID_PERIOD;
    }

    // check invalid lot quantity consumed
    if (row.quantity_consumed < 0) {
      row._error = ERR_INVALID_QUANTITY_NEGATIVE;
    }

    // check invalid lot quantity lost
    if (row.quantity_lost < 0) {
      row._error = ERR_INVALID_QUANTITY_NEGATIVE;
    }

    row.isInvalid = row._error != null;
    row.isValid = !row.isInvalid;
  }

  function validateAllRows() {
    const errors = [];

    if (this.rows.length === 0) {
      errors.push(ERR_NO_ROWS);
    }

    if (this.opts.max_quantity_consumed < this.totalConsumed()) {
      errors.push(ERR_QUANTITY_CONSUMED_OVER_GLOBAL);
    }

    if (this.opts.max_quantity_lost < this.totalLost()) {
      errors.push(ERR_QUANTITY_LOST_OVER_GLOBAL);
    }

    if (this.opts.max_quantity_consumed > this.totalConsumed()) {
      errors.push(ERR_QUANTITY_CONSUMED_LOWER);
    }

    if (this.opts.max_quantity_lost > this.totalLost()) {
      errors.push(ERR_QUANTITY_LOST_LOWER);
    }

    if (this.unit_cost === undefined) {
      errors.push(ERR_MISSING_LOT_UNIT_COST);
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
