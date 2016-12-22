
exports.generate = generate;

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
const UUID_ACCURACY_LENGTH = 12;

function generate(receiptIdentifier, uuid) {
  let entityIdentifier = uuid.substr(0, UUID_ACCURACY_LENGTH);

  return `${receiptIdentifier}${entityIdentifier}`;
}
