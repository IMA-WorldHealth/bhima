/**
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
* TODO: We should migrate the inventory to using the regular bhima guidelines.
*/
const _ = require('lodash');
const core = require('./inventory/core');
const groups = require('./inventory/groups');
const types = require('./inventory/types');
const units = require('./inventory/units');
const importing = require('./import');
const util = require('../../lib/util');

const xlsx = require('../../lib/renderers/xlsx');
const ReportManager = require('../../lib/ReportManager');

// exposed routes
exports.createInventoryItems = createInventoryItems;
exports.updateInventoryItems = updateInventoryItems;
exports.getInventoryItems = getInventoryItems;
exports.getInventoryItemsById = getInventoryItemsById;

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

exports.deleteInventory = deleteInventory;

// expose routes for import
exports.importing = importing;

exports.logs = inventoryLog;
exports.logDownLoad = logDownLoad;


// ======================= inventory metadata =============================
/**
 * POST /inventory/metadata
 * Create a new inventory data entry
 */
function createInventoryItems(req, res, next) {
  core.createItemsMetadata(req.body, req.session)
    .then((identifier) => {
      res.status(201).json({ uuid : identifier });
    })
    .catch((error) => {
      core.errorHandler(error, req, res, next);
    });
}

/**
 * PUT /inventory/:uuid/metadata
 * Update an inventory data entry
 */
function updateInventoryItems(req, res, next) {
  core.updateItemsMetadata(req.body, req.params.uuid, req.session)
    .then((metadata) => {
      res.status(200).json(metadata);
    })
    .catch((error) => {
      core.errorHandler(error, req, res, next);
    });
}


function inventoryLog(req, res, next) {
  core.inventoryLog(req.params.uuid).then(logs => {
    res.status(200).json(logs);
  }).catch(next);
}

// get inventory log as excel
// GET /inventory/download/log/:uuid?rendere=xlsx?lang=fr

async function logDownLoad(req, res, next) {
  try {
    const { lang } = req.query;
    const rows = await core.inventoryLog(req.params.uuid);
    // inventory columns

    const dictionary = util.loadDictionary(lang);

    const inventory = await core.getItemsMetadata({ uuid : req.params.uuid });

    const lines = [
      { column1 : '', column2 : '', column3 : '' },
    ];

    lines.push({
      column1 : _.get(dictionary, 'FORM.LABELS.INVENTORY'),
      column2 : inventory[0].label || '',
      column3 : '',
    });

    lines.push({ column1 : '', column2 : '', column3 : '' });
    rows.forEach(r => {
      const text = JSON.parse(r.text);
      lines.push({
        column1 : _.get(dictionary, 'FORM.LABELS.USER'),
        column2 : _.get(dictionary, 'FORM.LABELS.DATE'),
        column3 : '',
      });

      lines.push({ column1 : r.userName, column2 : r.log_timestamp, column3 : '' });

      lines.push({
        column1 : '',
        column2 : _.get(dictionary, 'FORM.LABELS.FROM'),
        column3 : _.get(dictionary, 'FORM.LABELS.TO'),
      });

      const currentchanges = Object.keys(text.current);
      currentchanges.forEach(cc => {
        const line2 = {
          column1 : _.get(dictionary, core.inventoryColsMap[cc]),
          column2 : text.last[cc],
          column3 : text.current[cc],
        };
        lines.push(line2);
      });

      lines.push({ column1 : '', column2 : '', column3 : '' });
    });


    const options = {
      csvKey : 'rows',
      suppressDefaultFormatting : true,
      suppressDefaultFiltering : true,
      renderer : 'xlsx',
      filename : 'FORM.LABELS.CHANGES',
    };

    const report = new ReportManager('', req.session, options);
    const result = await report.render({ rows : lines }, null, { lang });
    res.set(xlsx.headers).send(result.report);
  } catch (error) {
    next(error);
  }

}

/**
  * GET /inventory/metadata/
  * Returns a description all inventory items in the inventory table.
  * Returns a description the inventory items filter by params.
  *
  * @function searchInventoryItems
*/
function getInventoryItems(req, res, next) {
  const params = req.query;

  core.getItemsMetadata(params)
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
  const { uuid } = req.params;

  core.getItemsMetadataById(uuid)
    .then((row) => {
      res.status(200).json(row);
    })
    .catch((error) => {
      core.errorHandler(error, req, res, next);
    })
    .done();
}


/**
 * DELETE /inventory/:uuid
 * delete an inventory group
 */
function deleteInventory(req, res, next) {

  core.remove(req.params.uuid)
    .then(res.sendStatus(204))
    .catch(error => core.errorHandler(error, req, res, next))
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
      res.status(201).json({ uuid : identifier });
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
