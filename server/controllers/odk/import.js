const db = require('../../lib/db');
const util = require('../../lib/util');
const Fiscal = require('../finance/fiscal');
const { flux } = require('../../config/constants');
const central = require('./central');
const { updateQuantityInStockAfterMovement } = require('../stock');

exports.loadData = loadData;

// Perfoms actions based on project and form id
async function loadData(req, res, next) {
  const { formId } = req.params;
  const projectId = process.env.ODK_CENTRAL_PROJECT_ID;

  const mapActions = {
    pcima_pv_reception : loadFosaData,
  };

  try {
    const data = await mapActions[formId](projectId, formId, req.session);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
}

// fetch all depots
async function fetchAllDepots() {
  return db.exec('SELECT uuid, BUID(uuid) hrUuid, text FROM depot;');
}

// fetch all lots
async function fetchAllLots() {
  const query = `
    SELECT uuid, BUID(uuid) hr_uuid, unit_cost, BUID(inventory_uuid) inventory_uuid, label, description FROM lot;
  `;
  return db.exec(query);
}

// fetch all movements
async function fetchAllMovements() {
  const query = `
    SELECT
      document_uuid, depot_uuid, BUID(depot_uuid) hr_depot_uuid,
      entity_uuid, BUID(entity_uuid) hr_entity_uuid,
      lot_uuid, BUID(lot_uuid) hr_lot_uuid, is_exit
    FROM stock_movement;
  `;
  return db.exec(query);
}

/**
 * Import stock movements from odk
 */
async function loadFosaData(projectId, formId, session) {
  const submissions = await central.submissions(projectId, formId);
  const values = submissions.value;
  const processed = [];
  const transaction = db.transaction();

  // MINIMIZE ALL FETCHING DATA FROM DB FUNCTIONS IN LOOP
  // extract data for not using call to database in loop
  // all good alternative for not crashing the server on error are welcome
  const allDepots = await fetchAllDepots();
  const allLots = await fetchAllLots();
  const allMovements = await fetchAllMovements();
  const updateStockData = [];
  const inventoryUuids = [];

  // extract periods from loop
  // const periods = values.map(async line => {
  //   const period = {};
  //   period[line.date] = await Fiscal.lookupFiscalYearByDate(line.date);
  //   return period;
  // });

  // CLEAN ALL PREVIOUS IMPORTED DATA
  await db.exec('DELETE FROM stock_movement WHERE description LIKE "[ODK] RECEPTION FOSA"');

  // process each line as a separated document
  values.forEach(async line => {
    let depotPattern;

    const operationDate = new Date(line.date);
    const destination = line.depot_destination;

    const depotType = String(destination.depot_type_destination).toUpperCase();
    const depotName = destination.structure_coallesced;
    const depotZone = destination.health_zone;
    const depotArea = destination.health_area;
    const depotZoneArea = `(${depotZone}/${depotArea})`;

    if (depotType === 'FOSA') {
      depotPattern = `${depotType} - ${depotName} ${depotZoneArea}`;
    } else if (depotType === 'BCZ') {
      depotPattern = `${depotType} - ${depotZone}`;
    } else if (depotType === 'CDR') {
      depotPattern = `${depotType} - ${destination.cdr}`;
    }

    // look for the depot
    const qDepot = allDepots.filter(depot => depot.text === depotPattern);
    const depotUuid = qDepot.length ? qDepot[0].uuid : undefined;
    const depotHrUuid = qDepot.length ? qDepot[0].hrUuid : undefined;

    // get the fiscal year period information
    const period = await Fiscal.lookupFiscalYearByDate(line.date);

    const lots = line.boite_barcode_repeat.map(lot => {
      return {
        barcode : lot.boite_barcode,
        batchNumber : lot.boite_batch_number,
        expirationDate : lot.boite_expiration_date,
        produit : lot.boite_produit,
        date : new Date(line.date),
        typeDestination : destination.depot_type_destination,
        healthZone : destination.health_zone,
        healthArea : destination.health_area,
        structure : destination.structure_coallesced,
        cdr : destination.cdr,
      };
    });

    lots.forEach(async item => {

      const qLot = allLots.filter(lot => lot.label === item.barcode && lot.description === item.batchNumber);
      const lotUuid = qLot.length ? qLot[0].uuid : undefined;
      const lotHrUuid = qLot.length ? qLot[0].hr_uuid : undefined;
      const lotUnitCost = qLot.length ? qLot[0].unit_cost : undefined;
      const inventoryUuid = qLot.length ? qLot[0].inventory_uuid : undefined;

      const qOrigin = allMovements
        .filter(mov => +mov.is_exit === 1 && mov.hr_lot_uuid === lotHrUuid && mov.hr_entity_uuid === depotHrUuid);
      const originDocumentUuid = qOrigin.length ? qOrigin[0].document_uuid : undefined;
      const originDepotUuid = qOrigin.length ? qOrigin[0].depot_uuid : undefined;

      // make sure there was a stock exit in bhima for this entry from odk
      if (depotUuid && originDocumentUuid) {
        const record = {
          depot_uuid : depotUuid,
          entity_uuid : originDepotUuid,
          is_exit : 0,
          flux_id : flux.FROM_OTHER_DEPOT,
          uuid : db.bid(util.uuid()),
          lot_uuid : lotUuid,
          document_uuid : originDocumentUuid,
          quantity : 1,
          unit_cost : lotUnitCost,
          date : operationDate,
          description : '[ODK] RECEPTION FOSA',
          user_id : session.user.id,
          period_id : period.id,
        };
        transaction.addQuery('INSERT INTO stock_movement SET ?', [record]);
        processed.push(item);

        // gather inventory uuids for later quantity in stock calculation updates
        inventoryUuids.push(inventoryUuid);
      }
    });

    // update the quantity in stock as needed
    if (inventoryUuids.length) {
      const uniqueInventoryUuids = inventoryUuids.filter((item, index, arr) => arr.indexOf(item) === index);
      const dataToUpdate = {
        inventories : uniqueInventoryUuids,
        date : operationDate,
        depot : depotHrUuid,
      };
      updateStockData.push(dataToUpdate);

      // add transaction to recompute stock value
      transaction.addQuery('CALL RecomputeStockValue(NULL);');
    }
  });

  // execute the movement
  await transaction.execute();

  // update stock quantities
  const dbPromise = updateStockData
    .map(data => updateQuantityInStockAfterMovement(data.inventories, data.date, data.depot));
  await Promise.all(dbPromise);

  // for the client
  return processed;
}
