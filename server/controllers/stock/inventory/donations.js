/**
* Inventory Donations
*
* This module is responsible for finding donations that have been made to the
* enterprise for particular inventory items.
*/

var db = require('../../../lib/db');

exports.getInventoryDonations = getInventoryDonations;
exports.getInventoryDonationsById = getInventoryDonationsById;

// all donations for all inventory items
function getInventoryDonations() {
  'use strict';

  var sql;

  sql =
    `SELECT dr.name, d.date, i.text AS label, s.lot_number, s.quantity
    FROM donor AS dr JOIN donations AS d JOIN donation_item AS di JOIN inventory AS i JOIN stock AS s ON
      dr.id = d.donor_id AND d.uuid = di.donation_uuid AND
      s.tracking_number = di.tracking_number AND
      i.uuid = s.inventory_uuid
    WHERE d.is_received = 1 
    ORDER BY d.date DESC;`;

  return db.exec(sql);
}

// returns all donations for a particular inventory uuid
function getInventoryDonationsById(uuid) {
  'use strict';

  var sql;

  sql =
    `SELECT dr.name, d.date, i.text AS label, s.lot_number, s.quantity
    FROM donor AS dr JOIN donations AS d JOIN donation_item AS di JOIN inventory AS i JOIN stock AS s ON
      dr.id = d.donor_id AND d.uuid = di.donation_uuid AND
      s.tracking_number = di.tracking_number AND
      i.uuid = s.inventory_uuid
    WHERE donations.is_received = 1 AND i.uuid = ?
    ORDER BY d.date;`;

  return db.exec(sql, [uuid]);
}
