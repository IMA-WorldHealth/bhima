angular.module('bhima.constants')
  .constant('bhConstants', constantConfig());

/**
 * TODO - Some of these constants are system standards, others should be
 * populated according to the enterprise configuration.
 */
function constantConfig() {
  var UTIL_BAR_HEIGHT = '106px';
  var JOURNAL_UTIL_HEIGHT = '150px';

  return {
    accounts : {
      ROOT  : 0,
      TITLE : 6,
    },
    purchase : {
      GRID_HEIGHT : 200,
      TITLE       : 4,
    },
    settings : {
      CONTACT_EMAIL : 'developers@imaworldhealth.org',
    },
    dates : {
      minDOB : new Date('1900-01-01'),
      format : 'dd/MM/yyyy',
      formatDB : 'YYYY-MM-DD',
    },
    yearOptions : {
      format         : 'yyyy',
      datepickerMode : 'year',
      minMode        : 'year',
    },
    dayOptions : {
      format         : 'dd/MM/yyyy',
      datepickerMode : 'day',
      minMode        : 'day',
    },
    lengths : {
      maxTextLength   : 1000,
      minDecimalValue : 0.0001,
    },
    grid : {
      ROW_HIGHLIGHT_FLAG : '_highlight',
      ROW_ERROR_FLAG     : '_error',
      FILTER_BAR_HEIGHT  : { height : 'calc(100vh - 105px)' },
    },
    transactions : {
      ROW_EDIT_FLAG      : '_edit',
      ROW_HIGHLIGHT_FLAG : '_highlight',
      ROW_INVALID_FLAG   : '_invalid',
    },
    barcodes : {
      LENGTH : 10,
    },
    transactionType : {
      GENERIC_INCOME     : 1,
      CASH_PAYMENT       : 2,
      CONVENTION_PAYMENT : 3,
      SUPPORT_INCOME     : 4,
      TRANSFER           : 5,
      GENERIC_EXPENSE    : 6,
      SALARY_PAYMENT     : 7,
      CASH_RETURN        : 8,
      PURCHASES          : 9,
      CREDIT_NOTE        : 10,
      INVOICING          : 11,
      INCOME             : 'income',
      EXPENSE            : 'expense',
      OTHER              : 'other',
    },
    flux : {
      FROM_PURCHASE    : 1,
      FROM_OTHER_DEPOT : 2,
      FROM_ADJUSTMENT  : 3,
      FROM_PATIENT     : 4,
      FROM_SERVICE     : 5,
      FROM_DONATION    : 6,
      FROM_LOSS        : 7,
      TO_OTHER_DEPOT   : 8,
      TO_PATIENT       : 9,
      TO_SERVICE       : 10,
      TO_LOSS          : 11,
      TO_ADJUSTMENT    : 12,
      FROM_INTEGRATION : 13,
    },
    stockStatus : {
      IS_SOLD_OUT          : 'sold_out',
      IS_IN_STOCK          : 'in_stock',
      HAS_SECURITY_WARNING : 'security_reached',
      HAS_MINIMUM_WARNING  : 'minimum_reached',
      HAS_OVERAGE_WARNING  : 'over_maximum',
    },
    reports : {
      AGED_DEBTOR    : 'AGED_DEBTOR',
      CASHFLOW       : 'CASHFLOW',
      INCOME_EXPENSE : 'INCOME_EXPENSE',
    },
    precision : {
      MAX_DECIMAL_PRECISION : 4,
    },
    utilBar : {
      height               : UTIL_BAR_HEIGHT,
      expandedHeightStyle  : { height : 'calc(100vh - '.concat(UTIL_BAR_HEIGHT, ')') },
      journalHeightStyle   : { height : 'calc(100vh - '.concat(JOURNAL_UTIL_HEIGHT, ')') },
      collapsedHeightStyle : {},
    },
    identifiers : {
      PATIENT : {
        key   : 'PA',
        table : 'patient',
      },
    },
    defaultFilters : [
      { key : 'period', label : 'TABLE.COLUMNS.PERIOD', valueFilter : 'translate' },
      { key : 'custom_period_start', label : 'PERIODS.START', comparitor: '>', valueFilter : 'date' },
      { key : 'custom_period_end', label : 'PERIODS.END', comparitor: '<', valueFilter : 'date' },
      { key : 'limit', label : 'FORM.LABELS.LIMIT' }],
  };
}

