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

  if (!documentDefinition) {
    throw new BadRequest(`Invalid document type provided - '${code}'`);
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

