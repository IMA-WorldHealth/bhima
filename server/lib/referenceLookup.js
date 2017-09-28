// API /entityLink/:codeRef/:language
const _ = require('lodash');

// module dependencies
const db = require('../lib/db');
const identifiers = require('../config/identifiers');
const BadRequest = require('../lib/errors/BadRequest');

exports.getEntity = getEntity;

// loading identifiers keys, used for defining the table name
const identifiersIndex = {};
indexIdentifiers();

// This function render a report in the browser
// It search a saved entity
// It requires a  reference code and language as paramters
// The reference code is a combination of table_key.project_abbr.reference
// The table name is variable, it can be :invoice, cash or voucher
function getEntity(req, res, next) {
  const codeRef = req.params.codeRef.split('.');
  const language = req.params.language;

  const code = codeRef[0];
  const projectName = codeRef[1];
  const reference = codeRef[2];
  const documentDefinition = identifiersIndex[code];

  // hack: handle special case of stock movements
  const STOCK_MOVEMENT_PREFIX = 'SM';
  const fluxId = codeRef[1];

  if (code === STOCK_MOVEMENT_PREFIX) {
    const type = stockMovementType(fluxId);
    const queryDocument = `SELECT BUID(uuid) as uuid FROM document_map WHERE text = ?`;

    return db.one(queryDocument, [req.params.codeRef])
      .then(entity => {
        const uuid = entity.uuid;
        const path = ''.concat('/receipts/stock/', type.path, '/');
        const url = `${path}${uuid}?lang=${language}&renderer=pdf`;
        res.redirect(url);
      })
      .catch(next)
      .done();
  }

  // consider corner cases to gaurd against infinite redirects
  if (!documentDefinition) {
    throw new BadRequest(`Invalid document type provided - '${code}'`);
  }

  if (!documentDefinition.documentPath) {
    throw new BadRequest(`Document type does not support document path - '${code}'`);
  }

  const query = `
    SELECT BUID(uuid) as uuid
    FROM ${documentDefinition.table} as documentTable JOIN project ON documentTable.project_id = project.id
    WHERE project.abbr = ? AND documentTable.reference = ?
  `;

  // search for full UUID
  db.one(query, [projectName, reference])
    .then((entity) => {
      const uuid = entity.uuid;
      const url = `${documentDefinition.documentPath}${uuid}?lang=${language}&renderer=pdf`;

      res.redirect(url);
    })
    .catch(next)
    .done();
}

function indexIdentifiers() {
  _.forEach(identifiers, (entity) => {
    identifiersIndex[entity.key] = entity;
  });
}

// hack: handle special case of stock movements
function stockMovementType(id) {
  /**
   * Stock Receipt API
   * /receipts/stock/{{name}}/:document_uuid
   *
   * the {{name}} is what we define for example in { key : 'FROM_PURCHASE', path :'entry_purchase' },
   *
   * empty {{name}} means that there is no API entry for this name.
   */
  const flux = {
    1  : { key : 'FROM_PURCHASE', path : 'entry_purchase' },
    2  : { key : 'FROM_OTHER_DEPOT', path : 'entry_depot' },
    3  : { key : 'FROM_ADJUSTMENT', path : 'adjustment' },
    4  : { key : 'FROM_PATIENT', path : '' },
    5  : { key : 'FROM_SERVICE', path : '' },
    6  : { key : 'FROM_DONATION', path : 'entry_donation' },
    7  : { key : 'FROM_LOSS', path : 'entry_loss' },
    8  : { key : 'TO_OTHER_DEPOT', path : 'exit_depot' },
    9  : { key : 'TO_PATIENT', path : 'exit_patient' },
    10 : { key : 'TO_SERVICE', path : 'exit_service' },
    11 : { key : 'TO_LOSS', path : 'exit_loss' },
    12 : { key : 'TO_ADJUSTMENT', path : 'adjustment' },
    13 : { key : 'FROM_INTEGRATION', path : 'entry_integration' },
  };
  return flux[id];
}

