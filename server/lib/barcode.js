const _ = require('lodash');
const debug = require('debug')('barcode');

const db = require('./db');
const BadRequest = require('./errors/BadRequest');
const identifiers = require('../config/identifiers');

exports.generate = generate;
exports.reverseLookup = reverseLookup;

const { lookupPatient } = require('../controllers/medical/patients');
const { lookupInvoice } = require('../controllers/finance/patientInvoice');
const lookupCashPayment = require('../controllers/finance/cash').lookup;
const { lookupVoucher } = require('../controllers/finance/vouchers');

const identifiersIndex = {};
indexIdentifiers();

/**
 * @description
 * Standard method for generating the code used to display bar codes, this
 * provides a uniform interface ensuring that all barcodes displayed to users
 * use the same schema.
 *
 * ##Current Schema
 * ${receiptIdentifier}.${uuid(6)}
 *
 */
const UUID_ACCURACY_LENGTH = 8;
function generate(receiptIdentifier, uuid) {
  const entityIdentifier = uuid.substr(0, UUID_ACCURACY_LENGTH);
  return `${receiptIdentifier}${entityIdentifier}`;
}

// barcode standard:
// XX.YYYYYYYY
// XX - Entity code; This is defined on the server
// YYYYYYYY - First characters of the entity UUID
// - returns the full UUID of the entity
function reverseLookup(barcodeKey) {
  const code = barcodeKey.substr(0, 2).toUpperCase();
  const partialUuid = barcodeKey.substr(2, barcodeKey.length);
  const documentDefinition = identifiersIndex[code];

  debug(`reverse lookup of uuid using ${barcodeKey}.`);

  if (!documentDefinition) {
    throw new BadRequest(`Invalid barcode document type '${code}'`);
  }

  if (!documentDefinition.lookup) {
    throw new BadRequest(`No lookup method has been defined for barcode document type '${code}'`);
  }

  const query = `
    SELECT BUID(uuid) as uuid FROM ${documentDefinition.table}
    WHERE BUID(uuid) LIKE '${partialUuid}%';
  `;

  // search for full UUID
  return db.one(query)
    .then(result => documentDefinition.lookup(result.uuid))
    .then((entity) => {
      debug(`lookup found: ${entity.uuid}.`);

      // @todo review specific logic flow
      if (documentDefinition.redirectPath) {
        entity._redirectPath = documentDefinition.redirectPath.replace('?', entity.uuid);
      }

      return entity;
    });
}

function indexIdentifiers() {
  _.forEach(identifiers, (entity) => {
    identifiersIndex[entity.key] = entity;
  });

  // assign lookup methods to supported entity types
  // @TODO this method of mapping should be reviewed
  identifiers.PATIENT.lookup = lookupPatient;
  identifiers.INVOICE.lookup = lookupInvoice;
  identifiers.CASH_PAYMENT.lookup = lookupCashPayment;
  identifiers.VOUCHER.lookup = lookupVoucher;
}
