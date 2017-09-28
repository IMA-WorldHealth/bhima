// API /entityLink/:codeRef/:language
const _ = require('lodash');

// module dependencies
const db = require('../lib/db');
const identifiers = require('../config/identifiers');
const stockCommon = require('../controllers/stock/reports/common');
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

  // handle stock movement reference
  const STOCK_MOVEMENT_PREFIX = 'SM';
  const fluxId = codeRef[1];

  if (code === STOCK_MOVEMENT_PREFIX) {
    const type = getStockMovementType(fluxId);
    const queryDocument = `SELECT BUID(uuid) as uuid FROM document_map WHERE text = ?`;

    return db.one(queryDocument, [req.params.codeRef])
      .then(entity => {
        const uuid = entity.uuid;
        const path = `/receipts/stock/${type.path}/`;
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

// get stock movement type
function getStockMovementType(id) {
  return stockCommon.stockFluxReceipt[id];
}

