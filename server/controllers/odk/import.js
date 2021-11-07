const db = require('../../lib/db');
const util = require('../../lib/util');
const Fiscal = require('../finance/fiscal');
const { flux } = require('../../config/constants');
const central = require('./central');
const { updateQuantityInStockAfterMovement } = require('../stock');

exports.loadData = loadData;

// Perfoms actions based on project and form id
async function loadData(req, res, next) {
  const { projectId, formId } = req.params;

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

/**
 * Import stock movements from odk
 */
async function loadFosaData(projectId, formId, session) {
  const submissions = await central.submissions(projectId, formId);
  const values = submissions.value;
  const transaction = db.transaction();

  // process each line as a separated document
  return values.map(async line => {
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
    const qDepot = await db.exec('SELECT uuid FROM depot WHERE `text` LIKE ? LIMIT 1;', [depotPattern]);
    const depotUuid = qDepot.length ? qDepot[0].uuid : undefined;

    // get the fiscal year period information
    const period = await Fiscal.lookupFiscalYearByDate(operationDate);

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
      // lot details
      const lotSelector = `
        SELECT uuid, unit_cost, inventory_uuid FROM lot 
        WHERE label = ? AND description = ? LIMIT 1;
      `;
      const qLot = await db.exec(lotSelector, [item.barcode, item.batchNumber]);
      const lotUuid = qLot.length ? qLot[0].uuid : undefined;
      const lotUnitCost = qLot.length ? qLot[0].unit_cost : undefined;
      item.inventoryUuid = qLot.length ? qLot[0].inventory_uuid : undefined;

      // origin details
      const originSelector = `
        SELECT document_uuid, depot_uuid FROM stock_movement 
        WHERE lot_uuid = ? AND is_exit = 1 AND entity_uuid = ? LIMIT 1;
      `;
      const qOrigin = await db.exec(originSelector, [lotUuid, depotUuid]);
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
          description : 'RECEPTION FOSA',
          user_id : session.user.id,
          period_id : period.id,
        };
        transaction.addQuery('INSERT INTO stock_movement SET ?', [record]);
      }
    });

    // gather inventory uuids for later quantity in stock calculation updates
    const inventoryUuids = lots.map(lot => lot.inventoryUuid);
    const uniqueInventoryUuid = inventoryUuids.map((item, index, arr) => arr.indexOf(item) === index);

    transaction.addQuery('CALL RecomputeStockValue(NULL);');
    // execute the movement
    await transaction.execute();
    // update the quantity in stock as needed
    await updateQuantityInStockAfterMovement(uniqueInventoryUuid, operationDate, depotUuid);

    return line;
  });
}
