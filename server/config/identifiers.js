/**
 * @overview identifiers
 *
 * @description
 * This file contains the identifier mapping for each entity for which BHIMA
 * generates a receipt.  It provides an identifier that is templated into the
 * human readable ID on HTTP requests to provide more context than the simple
 * {project_id}.{increment} schema previously used.
 *
 * documentPath - server side route for generating the entities document
 * redirectPath - direct to client side entity representation
 */

module.exports = {
  VOUCHER : {
    key   : 'VO',
    table : 'voucher',
    documentPath : '/reports/finance/vouchers/',
  },
  EMPLOYEE : {
    key   : 'EM',
    table : 'employee',
    documentPath : '/reports/finance/employeeStanding/',
  },
  INVOICE : {
    key   : 'IV',
    table : 'invoice',
    documentPath : '/reports/finance/invoices/',
  },
  CASH_PAYMENT : {
    key   : 'CP',
    table : 'cash',
    documentPath : '/reports/finance/cash/',
  },
  PATIENT : {
    key          : 'PA',
    table        : 'patient',
    documentPath : '/reports/finance/financialPatient/',
    redirectPath : '/#!/patients/?',
  },
  DOCUMENT : {
    key : 'DO',
  },
  STOCK_ASSIGN : {
    key : 'SA',
    table : 'stock_assign',
  },
  STOCK_ENTRY : {
    key : 'SN',
  },
  STOCK_EXIT : {
    key : 'SX',
  },
  STOCK_MOVEMENT : {
    key : 'SM',
    table : 'stock_movement',
    redirectPath : '/#/stock/movements',
  },
  STOCK_LOT : {
    key : 'SL',
  },
  INVENTORY_ITEM : {
    key   : 'II',
    table : 'inventory',
  },
  PURCHASE_ORDER : {
    key   : 'PO',
    table : 'purchase_order',
  },
  DONATION : {
    key   : 'DON',
    table : 'donation',
  },
  INTEGRATION : {
    key   : 'INT',
    table : 'integration',
  },
  REQUISITION : {
    key   : 'SREQ',
    table : 'stock_requisition',
  },
};
