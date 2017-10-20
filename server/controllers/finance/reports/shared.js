const _ = require('lodash');

// translation key mappings for dynamic filters
// Basically, to show a pretty filter bar, this will translate URL query string
// into human-readable text to be placed in the report, showing the properties
// filtered on.
function formatFilters(qs) {
  const columns = [
    { field : 'billingDateFrom', displayName : 'FORM.LABELS.DATE', comparitor : '>', isDate : true },
    { field : 'billingDateTo', displayName : 'FORM.LABELS.DATE', comparitor : '<', isDate : true },
    { field : 'cashbox_id', displayName : 'FORM.LABELS.CASHBOX' },
    { field : 'cash_uuid', displayName : 'FORM.INFO.PAYMENT' },
    { field : 'currency_id', displayName : 'FORM.LABELS.CURRENCY' },
    { field : 'dateFrom', displayName : 'FORM.LABELS.DATE_FROM', comparitor : '>', isDate : true },
    { field : 'dateTo', displayName : 'FORM.LABELS.DATE_TO', comparitor : '<', isDate : true },
    { field : 'debtor_uuid', displayName : 'FORM.LABELS.CLIENT' },
    { field : 'debtor_group_uuid', displayName : 'FORM.LABELS.DEBTOR_GROUP' },

    { field : 'is_caution', displayName : 'FORM.LABELS.CAUTION' },
    { field : 'supplier_uuid', displayName : 'FORM.LABELS.SUPPLIER' },
    { field : 'status_id', displayName : 'PURCHASES.ORDER' },
    { field : 'patientReference', displayName : 'FORM.LABELS.REFERENCE_PATIENT' },
    { field : 'user_id', displayName : 'FORM.LABELS.USER' },

    { field : 'invoiceReference', displayName : 'FORM.LABELS.INVOICE' },
    { field : 'invoice_uuid', displayName : 'FORM.LABELS.INVOICE' },
    { field : 'service_id', displayName : 'FORM.LABELS.SERVICE' },
    { field : 'inventory_uuid', displayName : 'FORM.LABELS.INVENTORY' },

    { field : 'flux_id', displayName: 'STOCK.FLUX' },
    { field : 'status', displayName: 'STOCK.STATUS.LABEL' },

    { field : 'entry_date_from', displayName: 'STOCK.ENTRY_DATE', comparitor: '>', isDate : true },
    { field : 'entry_date_to', displayName: 'STOCK.ENTRY_DATE', comparitor: '<', isDate : true },
    { field : 'expiration_date_from', displayName: 'STOCK.EXPIRATION_DATE', comparitor: '>', isDate : true },
    { field : 'expiration_date_to', displayName: 'STOCK.EXPIRATION_DATE', comparitor: '<', isDate : true },
    { field : 'is_exit', displayName : 'STOCK.OUTPUT' },
    { field : 'label', displayName : 'STOCK.LOT' },
    { field : 'depot_uuid', displayName : 'STOCK.DEPOT' },

    { field : 'description', displayName : 'FORM.LABELS.DESCRIPTION' },
    { field : 'entity_uuid', displayName : 'FORM.LABELS.ENTITY' },
    { field : 'type_ids', displayName : 'FORM.LABELS.TRANSACTION_TYPE' },

    { field : 'reference', displayName : 'FORM.LABELS.REFERENCE' },
    { field : 'reversed', displayName : 'CASH.REGISTRY.REVERSED_RECORDS' },
    { field : 'limit', displayName : 'FORM.LABELS.LIMIT' },
    { field : 'period', displayName : 'TABLE.COLUMNS.PERIOD' },
    { field : 'custom_period_start', displayName : 'PERIODS.START', isDate : true, comparitor : '>' },
    { field : 'custom_period_end', displayName : 'PERIODS.END', isDate : true, comparitor : '<' },
  ];

  return columns.filter(column => {
    const value = qs[column.field];

    if (!_.isUndefined(value)) {
      column.value = value;
      return true;
    }
    return false;
  });
}

exports.formatFilters = formatFilters;
