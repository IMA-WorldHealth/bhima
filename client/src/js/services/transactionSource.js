angular.module('bhima.services')
.service('transactionSource', ['$translate', function ($translate) {
  var sources = {
    'cash'                  : 'SOURCE.CASH',
    'sale'                  : 'SOURCE.SALE',
    'journal'               : 'SOURCE.JOURNAL',
    'group_deb_invoice'     : 'SOURCE.GROUP_DEB_INVOICE',
    'credit_note'           : 'SOURCE.CREDIT_NOTE',
    'caution'               : 'SOURCE.CAUTION',
    'import_automatique'    : 'SOURCE.IMPORT_AUTOMATIQUE',
    'pcash_convention'      : 'SOURCE.PCASH_CONVENTION',
    'pcash_transfert'       : 'SOURCE.PCASH_TRANSFERT',
    'generic_income'        : 'SOURCE.GENERIC_INCOME',
    'distribution'          : 'SOURCE.DISTRIBUTION',
    'stock_loss'            : 'SOURCE.STOCK_LOSS',
    'payroll'               : 'SOURCE.PAYROLL',
    'donation'              : 'SOURCE.DONATION',
    'tax_payment'           : 'SOURCE.TAX_PAYMENT',
    'cotisation_engagement' : 'SOURCE.COTISATION_ENGAGEMENT',
    'tax_engagement'        : 'SOURCE.TAX_ENGAGEMENT',
    'cotisation_paiement'   : 'SOURCE.COTISATION_PAIEMENT',
    'generic_expense'       : 'SOURCE.GENERIC_EXPENSE',
    'indirect_purchase'     : 'SOURCE.INDIRECT_PURCHASE',
    'confirm_purchase'      : 'SOURCE.CONFIRM_PURCHASE',
    'salary_advance'        : 'SOURCE.SALARY_ADVANCE',
    'employee_invoice'      : 'SOURCE.EMPLOYEE_INVOICE',
    'pcash_employee'        : 'SOURCE.PCASH_EMPLOYEE',
    'cash_discard'          : 'SOURCE.CASH_DISCARD'
  };

  this.source = function (txt) {
    return sources[txt];
  };

  this.translate = function (txt) {
    return $translate.instant(sources[txt]);
  };

}]);
