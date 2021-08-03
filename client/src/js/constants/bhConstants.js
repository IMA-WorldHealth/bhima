angular.module('bhima.constants')
  .constant('bhConstants', constantConfig());

/**
 * TODO - Some of these constants are system standards, others should be
 * populated according to the enterprise configuration.
 */
function constantConfig() {
  const UTIL_BAR_HEIGHT = '106px';
  const JOURNAL_UTIL_HEIGHT = '150px';

  return {
    actions : {
      CAN_EDIT_ROLES : 1,
      CAN_UNPOST_TRANSACTIONS : 2,
      DELETE_CASH_PAYMENT : 3,
      DELETE_INVOICE : 4,
      DELETE_PURCHASE_ORDER : 5,
      DELETE_STOCK_MOVEMENT : 6,
      DELETE_VOUCHER : 7,
      EDIT_LOT : 8,
    },
    accounts : {
      ROOT  : 0,
      ASSET : 1,
      LIABILITY : 2,
      EQUITY : 3,
      INCOME : 4,
      EXPENSE : 5,
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
      formatLong : 'dd MMM yyyy hh:mm:ss',
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
      STOCK_INTEGRATION  : 12,
      STOCK_EXIT         : 13,
      STOCK_ENTRY        : 14,
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
      INVENTORY_RESET  : 14,
      INVENTORY_ADJUSTMENT : 15,
      AGGREGATED_CONSUMPTION : 16,
    },
    stockRequisition : {
      completed_status : 6,
    },
    stockStatus : {
      IS_STOCK_OUT         : 'stock_out',
      IS_IN_STOCK          : 'in_stock',
      HAS_SECURITY_WARNING : 'security_reached',
      HAS_MINIMUM_WARNING  : 'minimum_reached',
      HAS_OVERAGE_WARNING  : 'over_maximum',
      UNUSED_STOCK         : 'unused_stock',
      AVAILABLE_NOT_USABLE : 'available_not_usable',
    },
    reports : {
      AGED_DEBTOR    : 'AGED_DEBTOR',
      CASHFLOW       : 'CASHFLOW',
      INCOME_EXPENSE : 'INCOME_EXPENSE',
    },
    precision : {
      MAX_DECIMAL_PRECISION : 4,
      MAX_INTEGER : 16777215, // maximum unsigned MEDIUM INT in MySQL
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
      { key : 'includeEmptyLot', label : 'STOCK.INCLUDE_EMPTY_LOTS' },
      {
        key : 'custom_period_start',
        label : 'PERIODS.START',
        comparitor : '>',
        valueFilter : 'date',
      }, {
        key : 'custom_period_end',
        label : 'PERIODS.END',
        comparitor : '<',
        valueFilter : 'date',
      }, {
        key : 'limit',
        label : 'FORM.LABELS.LIMIT',
      },
    ],
    weekDays : [
      { id : 0, label : 'FORM.LABELS.WEEK_DAYS.SUNDAY', checked : false },
      { id : 1, label : 'FORM.LABELS.WEEK_DAYS.MONDAY', checked : false },
      { id : 2, label : 'FORM.LABELS.WEEK_DAYS.TUESDAY', checked : false },
      { id : 3, label : 'FORM.LABELS.WEEK_DAYS.WEDNESDAY', checked : false },
      { id : 4, label : 'FORM.LABELS.WEEK_DAYS.THURSDAY', checked : false },
      { id : 5, label : 'FORM.LABELS.WEEK_DAYS.FRIDAY', checked : false },
      { id : 6, label : 'FORM.LABELS.WEEK_DAYS.SATURDAY', checked : false },
    ],
    transactionTypeMap : {
      income : { label : 'VOUCHERS.SIMPLE.INCOME', value : 'income' },
      expense : { label : 'VOUCHERS.SIMPLE.EXPENSE', value : 'expense' },
      other : { label : 'FORM.LABELS.OTHER', value : 'other' },
    },
    gender : [
      { translation_key : 'FORM.LABELS.MALE', value : 'M' },
      { translation_key : 'FORM.LABELS.FEMALE', value : 'F' },
      { translation_key : 'FORM.LABELS.OTHER', value : 'O' },
    ],
    purchaseStatus : {
      WAITING_CONFIRMATION : 1,
      CONFIRMED : 2,
      RECEIVED : 3,
      PARTIALLY_RECEIVED : 4,
      CANCELLED : 5,
      EXCESSIVE_RECEIVED_QUANTITY : 6,
    },
    inventoryImportanceLevel : {
      LOW : 1,
      MID : 2,
      HIGH : 3,
    },
    average_consumption_algo : [
      {
        name : 'algo_def',
        label : 'STOCK.MONTHLY_CONSUMPTION.ALGORITHM_DEFAULT',
        comment : 'STOCK.MONTHLY_CONSUMPTION.ALGORITHM_DEFAULT_COMMENT',
      },
      {
        name : 'algo_msh',
        label : 'STOCK.MONTHLY_CONSUMPTION.ALGORITHM_MSH',
        comment : 'STOCK.MONTHLY_CONSUMPTION.ALGORITHM_MSH_COMMENT',
      },
    ],
  };
}
