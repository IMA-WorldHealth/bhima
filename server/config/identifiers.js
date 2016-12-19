/**
 * @overview identifiers
 *
 * @description
 * This file contains the identifier mapping for each entity for which bhima
 * generates a receipt.  It provides an identifier that is templated into the
 * human readable ID on HTTP requests to provide more context than the simple
 * {project_id}.{increment} schema previously used.
 */

module.exports = {
  VOUCHER : 'VO',
  EMPLOYEE : 'EM',
  INVOICE : 'IV',
  CASH_PAYMENT : 'CP',
  PATIENT : 'PA',
  DOCUMENT : 'DO',
  STOCK_ENTRY : 'SN',
  STOCK_EXIT : 'SX',
  STOCK_MOVEMENT : 'SM',
  STOCK_LOT : 'SL',
  INVENTORY_ITEM : 'II',
  PURCHASE_ORDER : 'PO'
};
