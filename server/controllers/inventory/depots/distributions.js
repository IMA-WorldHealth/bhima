/**
* Depot Distributions Controller
*
* Implements full CRUD for creating distributions (consumptions).  This is an
* overloaded route, meaning it handles distributions to services, patients,
* losses and rummage sales.
*
* TODO -- complete the full CRUD described above.
*
* FIXME/TODO
*
* This analysis has brought to light several interesting parts of stock
* management that could probably be redesigned.
*  1) Why are there duplicated document_ids in consumption_loss and consumption?
*
*/

const db = require('../../../lib/db');
const uuid = require('node-uuid');
const q = require('q');

// @fixme remove this file
const journal = {};

exports.createDistributions = createDistributions;

/**
* Create a distribution
*/
function createDistributions(depotId, body, session) {
  // create a new document id
  const docId = uuid();

  // map to create specific distribution
  const fmap = {
    service : createServiceDistribution,
    patient : createPatientDistribution,
    loss : createLossDistribution,
    rummage : createRummageDistribution,
  };

  // if the type does not map to one of the function above, reject with an error
  // ERR_INVALID_DISTRIBUTION_TYPE
  if (!fmap[body.type]) {
    q.reject({
      code : 'ERR_INVALID_DISTRIBUTION_TYPE',
      reason : 'The distribution \'type\' property was not correctly set.',
    });

    return;
  }

  // TODO -- it turns out that we create n rows for each consumption and n rows
  // in the associated service/patient/loss/etc consumption table.  This seems
  // like it could/should be redesigned

  const sql =
    `INSERT INTO consumption (uuid, depot_uuid, date, document_id, tracking_number, quantity, unit_price)
    VALUES (?, ?, ?, ?, ?, ?, ?);`;

  const queries = body.data.map((row) => {
    row.id = uuid();

    return db.exec(sql, [row.id, depotId, row.date, docId, row.tracking_number, row.quantity, row.unit_price])
      .then(() => {
        return fmap[body.type](depotId, row);
      });
  });

  q.all(queries)
    .then(() => {
    // FIXME -- this is currently only implemented for the service distribution type
    // write to the journal
      return writeToJournal(body.type, docId, session);
    })
    .then(() => {
    // send that data back up to the parent controller
      return docId;
    });
}

// FIXME
// poorly designed code to write to the journal
function writeToJournal(type, docId, session) {
  const dfd = q.defer();

  journal.request('distribution_%type%'.replace('%type%', type), docId, session.user.id, (error, result) => {
    if (error) { return dfd.reject(error); }
    return dfd.resolve(result);

  // FIXME
  // This API needs to change.
  }, undefined, session);

  return dfd.promise;
}

// create a patient distribution
function createPatientDistribution() {

  // TODO
}

// create a service distribution
function createServiceDistribution(depotId, item) {
  var sql =
    'INSERT INTO consumption_service VALUES (?, ?, ?);';

  return db.exec(sql, [uuid(), item.id, item.service_id]);
}

/**
* Create a loss distribution
*
* This writes a uuid and the consumption uuid to the consumption loss table.
*
* TODO - discuss this design
*/
function createLossDistribution(depotId, item) {
  const sql =
    'INSERT INTO consumption_loss VALUES (?, ?);';

  return db.exec(sql, [uuid(), item.id]);
}


function createRummageDistribution() {

  // TODO
}
