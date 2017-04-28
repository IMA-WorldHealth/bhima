/**
* This module contains the following routes:
*   /inventory/consumption
*   /inventory/donations
*   /inventory/expiration
*   /inventory/leadtimes
*   /inventory/metadata
*   /inventory/status
*   /inventory/:uuid/consumption
*   /inventory/:uuid/donations
*   /inventory/:uuid/expiration
*   /inventory/:uuid/leadtimes
*   /inventory/:uuid/metadata
*   /inventory/:uuid/stock
*   /inventory/:uuid/status
*
* TODO
* I would like to have a breakdown of usage by service.  How do I do this?
* What is the best HTTP API for this sort of complex linked data?
*
* It is meant to be a high-level API to data about inventory data.
*
* As per REST conventions, the routes with a UUID return a single
* JSON instance or 404 NOT FOUND.  The others return an array of
* results.
*
* TODO: We should migrate the inventory to using the regular bhima 2.x guidelines.
*/

const q = require('q');

const core = require('./inventory/core');
const consumption = require('./inventory/consumption');
const stock = require('./inventory/stock');
const expirations = require('./inventory/expiration');
const leadtimes = require('./inventory/leadtimes');
const lots = require('./inventory/lots');
const donations = require('./inventory/donations');
const stats = require('./inventory/status');
const groups = require('./inventory/groups');
const types = require('./inventory/types');
const units = require('./inventory/units');

// exposed routes
exports.createInventoryItems = createInventoryItems;
exports.updateInventoryItems = updateInventoryItems;
exports.getInventoryItems = getInventoryItems;
exports.getInventoryItemsById = getInventoryItemsById;
exports.searchInventoryItems = searchInventoryItems;

// expose inventory group methods
exports.createInventoryGroups = createInventoryGroups;
exports.updateInventoryGroups = updateInventoryGroups;
exports.listInventoryGroups = listInventoryGroups;
exports.detailsInventoryGroups = detailsInventoryGroups;
exports.deleteInventoryGroups = deleteInventoryGroups;
exports.countInventoryGroups = countInventoryGroups;

// expose inventory types methods
exports.createInventoryTypes = createInventoryTypes;
exports.updateInventoryTypes = updateInventoryTypes;
exports.listInventoryTypes = listInventoryTypes;
exports.detailsInventoryTypes = detailsInventoryTypes;
exports.deleteInventoryTypes = deleteInventoryTypes;

// expose inventory units methods
exports.createInventoryUnits = createInventoryUnits;
exports.updateInventoryUnits = updateInventoryUnits;
exports.listInventoryUnits = listInventoryUnits;
exports.detailsInventoryUnits = detailsInventoryUnits;
exports.deleteInventoryUnits = deleteInventoryUnits;

exports.getInventoryConsumptionById = getInventoryConsumptionById;
exports.getInventoryConsumption = getInventoryConsumption;

exports.getInventoryStockLevelsById = getInventoryStockLevelsById;
exports.getInventoryStockLevels = getInventoryStockLevels;

exports.getInventoryExpirations = getInventoryExpirations;
exports.getInventoryExpirationsById = getInventoryExpirationsById;

exports.getInventoryLots = getInventoryLots;
exports.getInventoryLotsById = getInventoryLotsById;

exports.getInventoryStatus = getInventoryStatus;
exports.getInventoryStatusById = getInventoryStatusById;

exports.getInventoryDonations = getInventoryDonations;
exports.getInventoryDonationsById = getInventoryDonationsById;

// ======================= inventory metadata =============================
/**
 * POST /inventory/metadata
 * Create a new inventory data entry
 */
function createInventoryItems(req, res, next) {
  core.createItemsMetadata(req.body, req.session)
    .then((identifier) => {
      res.status(201).json({ uuid: identifier });
    })
    .catch((error) => {
      core.errorHandler(error, req, res, next);
    })
    .done();
}

/**
 * PUT /inventory/:uuid/metadata
 * Update an inventory data entry
 */
function updateInventoryItems(req, res, next) {
  core.updateItemsMetadata(req.body, req.params.uuid)
    .then((metadata) => {
      res.status(200).json(metadata);
    })
    .catch((error) => {
      core.errorHandler(error, req, res, next);
    })
    .done();
}

/**
* GET /inventory/metadata
* Returns a description all inventory items in the inventory table.
*
* @function getInventoryItems
*/
function getInventoryItems(req, res, next) {
  core.getItemsMetadata()
  .then((rows) => {
    if (!rows.length) {
      throw core.errors.NO_INVENTORY_ITEMS;
    }

    res.status(200).json(rows);
  })
  .catch((error) => {
    core.errorHandler(error, req, res, next);
  })
  .done();
}


/**
* GET /inventory/metadata/search
* Returns a description the inventory items filter by params.
*
* @function searchInventoryItems
*/
function searchInventoryItems(req, res, next) {
  const params = req.query;

  core.getItemsMetadataSearch(params)
    .then((row) => {
      res.status(200).json(row);
    })
    .catch((error) => {
      core.errorHandler(error, req, res, next);
    })
    .done();
}


/**
* GET /inventory/metadata/:uuid
* Returns a description of the item from the inventory table.
*
* @function getInventoryItemsById
*/
function getInventoryItemsById(req, res, next) {
  const uuid = req.params.uuid;

  core.getItemsMetadataById(uuid)
    .then((row) => {
      res.status(200).json(row);
    })
    .catch((error) => {
      core.errorHandler(error, req, res, next);
    })
    .done();
}

// ======================= inventory group =============================

/**
 * POST /inventory/groups
 * Create a new inventory group
 */
function createInventoryGroups(req, res, next) {
  groups.create(req.body)
  .then((identifier) => {
    res.status(201).json({ uuid: identifier });
  })
  .catch((error) => {
    core.errorHandler(error, req, res, next);
  })
  .done();
}

/**
 * PUT /inventory/groups/:uuid
 * Create a new inventory group
 */
function updateInventoryGroups(req, res, next) {
  groups.update(req.body, req.params.uuid)
  .then((rows) => {
    res.status(201).json(rows);
  })
  .catch((error) => {
    core.errorHandler(error, req, res, next);
  })
  .done();
}

/**
 * GET /inventory/groups
 * get the list of inventory groups
 */
function listInventoryGroups(req, res, next) {
  groups.list(req.query.include_members)
  .then((rows) => {
    res.status(200).json(rows);
  })
  .catch((error) => {
    core.errorHandler(error, req, res, next);
  })
  .done();
}

/**
 * GET /inventory/groups/:uuid
 * get the list of inventory groups
 */
function detailsInventoryGroups(req, res, next) {
  groups.details(req.params.uuid)
  .then((rows) => {
    res.status(200).json(rows);
  })
  .catch((error) => {
    core.errorHandler(error, req, res, next);
  })
  .done();
}

/**
 * DELETE /inventory/groups/:uuid
 * delete an inventory group
 */
function deleteInventoryGroups(req, res, next) {
  groups.remove(req.params.uuid)
    .then(() => {
      res.sendStatus(204);
    })
    .catch((error) => {
      core.errorHandler(error, req, res, next);
    })
    .done();
}

/**
 * GET /inventory/groups/:uuid/count
 * count inventory in the group
 */
function countInventoryGroups(req, res, next) {
  groups.countInventory(req.params.uuid)
    .then((rows) => {
      res.status(200).json(rows[0].inventory_counted);
    })
    .catch((error) => {
      core.errorHandler(error, req, res, next);
    })
    .done();
}

// ======================= inventory type =============================
/**
 * POST /inventory/types
 * Create a new inventory types
 */
function createInventoryTypes(req, res, next) {
  types.create(req.body)
    .then((id) => {
      res.status(201).json({ id });
    })
    .catch((error) => {
      core.errorHandler(error, req, res, next);
    })
    .done();
}

/**
 * PUT /inventory/types/:id
 * Create a new inventory types
 */
function updateInventoryTypes(req, res, next) {
  types.update(req.body, req.params.id)
    .then((rows) => {
      res.status(201).json(rows);
    })
    .catch((error) => {
      core.errorHandler(error, req, res, next);
    })
    .done();
}

/**
 * GET /inventory/types
 * get the list of inventory types
 */
function listInventoryTypes(req, res, next) {
  types.list()
    .then((rows) => {
      res.status(200).json(rows);
    })
    .catch((error) => {
      core.errorHandler(error, req, res, next);
    })
    .done();
}

/**
 * GET /inventory/types/:id
 * get the list of inventory types
 */
function detailsInventoryTypes(req, res, next) {
  types.details(req.params.id)
    .then((rows) => {
      res.status(200).json(rows);
    })
    .catch((error) => {
      core.errorHandler(error, req, res, next);
    })
    .done();
}

/**
 * DELETE /inventory/types/:id
 * delete an inventory types
 */
function deleteInventoryTypes(req, res, next) {
  types.remove(req.params.id)
    .then(() => {
      res.sendStatus(204);
    })
    .catch((error) => {
      core.errorHandler(error, req, res, next);
    })
    .done();
}

// ======================= inventory unit =============================
/**
 * POST /inventory/units
 * Create a new inventory units
 */
function createInventoryUnits(req, res, next) {
  units.create(req.body)
    .then((id) => {
      res.status(201).json({ id });
    })
    .catch((error) => {
      core.errorHandler(error, req, res, next);
    })
    .done();
}

/**
 * PUT /inventory/units/:id
 * Create a new inventory units
 */
function updateInventoryUnits(req, res, next) {
  units.update(req.body, req.params.id)
    .then((rows) => {
      res.status(201).json(rows);
    })
    .catch((error) => {
      core.errorHandler(error, req, res, next);
    })
    .done();
}

/**
 * GET /inventory/units
 * get the list of inventory units
 */
function listInventoryUnits(req, res, next) {
  units.list()
  .then((rows) => {
    res.status(200).json(rows);
  })
  .catch((error) => {
    core.errorHandler(error, req, res, next);
  })
  .done();
}

/**
 * GET /inventory/units/:id
 * get the list of inventory units
 */
function detailsInventoryUnits(req, res, next) {
  units.details(req.params.id)
  .then((rows) => {
    res.status(200).json(rows);
  })
  .catch((error) => {
    core.errorHandler(error, req, res, next);
  })
  .done();
}

/**
 * DELETE /inventory/units/:id
 * delete an inventory unit
 */
function deleteInventoryUnits(req, res, next) {
  units.remove(req.params.id)
  .then(() => {
    res.sendStatus(204);
  })
  .catch((error) => {
    core.errorHandler(error, req, res, next);
  })
  .done();
}


/**
* GET /inventory/:uuid/consumption
* query options:
*   group={day|week|month|year}
*   start={date}
*   end={date}
*   average={0|1}
*
* Returns the consumption of a stock by the inventory item.
*/
function getInventoryConsumptionById(req, res, next) {
  let data;
  const uuid = req.params.uuid;
  const options = req.query;

  // enforce that both parameters exist or neither exist
  if (!core.hasBoth(options.start, options.end)) {
    return res.status(400).json(core.errors.MISSING_PARAMETERS);
  }

  // get the consumption
  return core.getIds(uuid)
    .then((rows) => {
      if (!rows.length) {
        throw core.errors.NO_INVENTORY_ITEMS;
      }

      // cache results
      data = rows[0];

      // query consumption data
      return options.average ?
        consumption.getAverageItemConsumption(uuid, options) :
        consumption.getItemConsumption(uuid, options);
    })
    .then((rows) => {
      if (!rows.length) {
        data.consumption = options.average ? 0 : [];
      } else {
        data.consumption = options.average ? rows[0].average : rows;
      }

      res.status(200).json(data);
    })
    .catch((error) => {
      core.errorHandler(error, req, res, next);
    })
    .done();
}

/*
* GET /inventory/consumption
* query options:
*   group={day|week|month|year}
*   start={date}
*   end={date}
*   detailed={default:0|1}
*   average={default:0|1}
*
* Returns the consumption of a stock by the inventory item.  If the detailed
* query is used, we return inventory metadata with the consumption.
*/
function getInventoryConsumption(req, res, next) {
  let data;
  const options = req.query;

  // TODO - is without an average and with an average different enough to
  // require two different routes?
  // Currently this function is pretty busy

  // enforce that both parameters exist or neither exist
  if (!core.hasBoth(options.start, options.end)) {
    return res.status(400).json(core.errors.MISSING_PARAMETERS);
  }

  // are we going to be getting all metadata or just ids?
  const func = options.detailed ? core.getItemsMetadata : core.getIds;

  return func()
    .then((rows) => {
      if (!rows.length) {
        throw core.errors.NO_INVENTORY_ITEMS;
      }

      // cache rows
      data = rows;

      // loop through all inventory items, calculating the consumption for each
      return q.all(data.map((item) => {
        let promise;
        if (options.average) {
          promise = consumption.getAverageItemConsumption(item.uuid, options);
        } else {
          promise = consumption.getItemConsumption(item.uuid, options);
        }
        return promise;
      }));
    })
    .then((rows) => {
      // Loop through the original array and associate promises (consumptions)
      // with the original inventory value
      data.forEach((item, idx) => {
        if (options.average) {
          const hasAvg = rows[idx].length > 0;

          // default to 0 if no average in place
          item.consumption = hasAvg ? rows[idx][0].average : 0;
        } else {
          item.consumption = rows[idx];
        }
      });

      // return to client
      res.status(200).json(data);
    })
    .catch((error) => {
      core.errorHandler(error, req, res, next);
    })
    .done();
}

/**
* GET /inventory/:uuid/leadtimes
* Calculates the lead time (delivery delay) associated with purchases on a
* single inventory item.
*/
exports.getInventoryLeadTimesById = function getInventoryLeadTimesById(req, res, next) {
  const uuid = req.params.uuid;
  const options = req.query;

  leadtimes.getInventoryLeadTimesById(uuid, options)
    .then((rows) => {
      if (!rows.length) {
        throw core.errors.NO_STOCK;
      }

      res.status(200).send(rows[0]);
    })
    .catch((error) => {
      core.errorHandler(error, req, res, next);
    })
    .done();
};


/**
* GET /inventory/:uuid/leadtimes
* Calculates the lead time (delivery delay) associated with purchases on a
* single inventory item.
*/
exports.getInventoryLeadTimes = function getInventoryLeadTimes(req, res, next) {
  const options = req.query;

  leadtimes.getInventoryLeadTimes(options)
    .then((rows) => {
      if (!rows.length) {
        throw core.errors.NO_STOCK;
      }

      res.status(200).send(rows);
    })
    .catch((error) => {
      core.errorHandler(error, req, res, next);
    })
    .done();
};


/**
* GET /inventory/stock
* Returns the inventory stock levels for a certain inventory item.
*
* TODO
* query options:
*   group={day|week|month|year}
*   start={date}
*   end={date}
*/
function getInventoryStockLevels(req, res, next) {
  const options = req.query;

  // enforce that both parameters exist or neither exist
  if (!core.hasBoth(options.start, options.end)) {
    return res.status(400).json(core.errors.MISSING_PARAMETERS);
  }

  return stock.getStockLevels(options)
    .then((rows) => {
      if (!rows.length) {
        throw core.errors.NO_STOCK;
      }

      res.status(200).json(rows);
    })
    .catch((error) => {
      core.errorHandler(error, req, res, next);
    })
    .done();
}

/**
* GET /inventory/:uuid/stock
* Returns the inventory levels for a certain inventory item.
*
* query options:
*   group={day|week|month|year}
*   start={date}
*   end={date}
*/
function getInventoryStockLevelsById(req, res, next) {
  const options = req.query;
  const uuid = req.params.uuid;

  // enforce that both parameters exist or neither exist
  if (!core.hasBoth(options.start, options.end)) {
    return res.status(400).json(core.errors.MISSING_PARAMETERS);
  }

  return stock.getStockLevelsById(uuid, options)
    .then((rows) => {
      // in case there are no records, make one up.  This makes sense for items
      // that have never been purchases.  If they have been purchased, rows would
      // not be empty.
      const value = (!rows.length) ? { uuid, quantity: 0 } : rows[0];

      res.status(200).json(value);
    })
    .catch((error) => {
      core.errorHandler(error, req, res, next);
    })
    .done();
}

/**
* GET /inventory/expirations
* Returns stock expirations between two given dates
*
* query options:
*   group={day|week|month|year}
*   start={date}
*   end={date}
*/
function getInventoryExpirations(req, res, next) {
  const options = req.query;

  // enforce that both parameters exist or neither exist
  if (!core.hasBoth(options.start, options.end)) {
    return res.status(400).json(core.errors.MISSING_PARAMETERS);
  }

  return expirations.getExpirations(options)
    .then((rows) => {
      res.status(200).json(rows);
    })
    .catch((error) => {
      core.errorHandler(error, req, res, next);
    })
    .done();
}

/**
* GET /inventory/:uuid/expirations
* Returns stock expirations between two given dates for a given inventory ID
*
* query options:
*   group={day|week|month|year}
*   start={date}
*   end={date}
*/
function getInventoryExpirationsById(req, res, next) {
  const options = req.query;
  const uuid = req.params.uuid;

  // enforce that both parameters exist or neither exist
  if (!core.hasBoth(options.start, options.end)) {
    return res.status(400).json(core.errors.MISSING_PARAMETERS);
  }

  return expirations.getExpirationsById(uuid, options)
    .then((rows) => {
      res.status(200).json(rows[0]);
    })
    .catch((error) => {
      core.errorHandler(error, req, res, next);
    })
    .done();
}

/**
* GET /inventory/lots
* Retrieve all active lots (quantity > 0) in the enterprise.  NOTE - this
* query does not filter by expiration date or any other stock metadata.
*/
function getInventoryLots(req, res, next) {
  let data;

  core.getIds()
    .then((rows) => {
      if (!rows.length) {
        throw core.errors.NO_INVENTORY_ITEMS;
      }

      // TODO - error handling: what about no inventory items?
      data = rows;

      // loop through inventory items, fetching the lots for each
      // from the database
      return q.all(data.map(i => lots.getInventoryLotsById(i.uuid)));
    })
    .then((ilots) => {
      if (!ilots.length) {
        throw core.errors.NO_STOCK;
      }

      // loop through, joining lots to their inventory items
      ilots.forEach((lot, idx) => {
        data[idx].lot = lot;
      });

      // send data to the client
      res.status(200).json(data);
    })
    .catch((error) => {
      core.errorHandler(error, req, res, next);
    })
    .done();
}

/**
* GET /inventory/:uuid/lots
* Retrieve all active lots (quantity > 0) for a given inventory item.  NOTE -
* this query does not filter by expiration date or any other stock metadata.
* Returns an array of lots to the client.
*
* @function getInventoryLotsById
*/
function getInventoryLotsById(req, res, next) {
  const uuid = req.params.uuid;

  lots.getInventoryLotsById(uuid)
    .then((rows) => {
      if (!rows.length) {
        throw core.errors.NO_STOCK;
      }

      res.status(200).json(rows);
    })
    .catch((error) => {
      core.errorHandler(error, req, res, next);
    })
    .done();
}

/**
* GET /inventory/status
* Retrieve the status of all inventory items in stock.  The status includes the
* following checks:
*   1) stockout
*   2) overstock
*   3) shortage (below minimum required level)
*/
function getInventoryStatus(req, res, next) {
  core.getIds()
    .then((rows) => {
      if (!rows.length) {
        throw core.errors.NO_INVENTORY_ITEMS;
      }

      return q.all(rows.map(i => stats.getInventoryStatusById(i.uuid)));
    })
    .then((rows) => {
      res.status(200).json(rows);
    })
    .catch((error) => {
      core.errorHandler(error, req, res, next);
    })
    .done();
}

/**
* GET /inventory/:uuid/status
* Retrieve the status of a particular inventory item.  The status includes the
* following checks:
*   1) stockout
*   2) overstock
*   3) shortage (below minimum required level)
*/
function getInventoryStatusById(req, res, next) {
  const uuid = req.params.uuid;

  stats.getInventoryStatusById(uuid)
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((error) => {
      core.errorHandler(error, next);
    })
    .done();
}

/**
* GET /inventory/donations
* Retrieve all donations from the inventory.
*/
function getInventoryDonations(req, res, next) {
  donations.getInventoryDonations()
  .then((data) => {
    res.status(200).json(data);
  })
  .catch((error) => {
    core.errorHandler(error, next);
  })
  .done();
}

/**
* GET /inventory/:uuid/donations
* Retrieve all donations from the inventory for a given inventory
* type.
*/
function getInventoryDonationsById(req, res, next) {
  const uuid = req.params.uuid;

  donations.getInventoryDonationsById(uuid)
  .then((data) => {
    res.status(200).json(data);
  })
  .catch((error) => {
    core.errorHandler(error, next);
  })
  .done();
}
