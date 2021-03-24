/**
 * CDR REPORTING END POINT
 */
const router = require('express').Router();
const excelToJson = require('convert-excel-to-json');

const { uuid } = require('../../lib/util');
const upload = require('../../lib/uploader');
const db = require('../../lib/db');

// router base is /cdr_reporting
const uploadFields = [
  { name : 'movements', maxCount : 1 },
  { name : 'articles', maxCount : 1 },
  { name : 'lots', maxCount : 1 },
  { name : 'lotsDoc', maxCount : 1 },
];
router.post('/depots', upload.multipleFields('cdr_reporting', uploadFields), create);
router.put('/depots/:uuid', upload.multipleFields('cdr_reporting', uploadFields), update);
router.get('/depots', list);
router.get('/depots/:uuid', details);
router.delete('/depots/:uuid', remove);

exports.router = router;

async function clearCdrDepotData(depotUuid) {
  const tx = db.transaction();
  const bid = db.bid(depotUuid);
  const queryDeleteMouvementStock = 'DELETE FROM cdr_reporting_mouvement_stock WHERE depot_uuid = ?;';
  const queryDeleteArticle = 'DELETE FROM cdr_reporting_article WHERE depot_uuid = ?;';
  const queryDeleteArticleLot = 'DELETE FROM cdr_reporting_article_lot WHERE depot_uuid = ?;';
  const queryDeleteLotDocument = 'DELETE FROM cdr_reporting_lot_document WHERE depot_uuid = ?;';
  tx.addQuery(queryDeleteMouvementStock, [bid]);
  tx.addQuery(queryDeleteArticle, [bid]);
  tx.addQuery(queryDeleteArticleLot, [bid]);
  tx.addQuery(queryDeleteLotDocument, [bid]);
  return tx.execute();
}

async function importCdrDepotDataFromFiles(files, depotUuid) {
  const tx = db.transaction();
  const movements = excelToJson({
    sourceFile : files.movements[0].link,
    header : {
      rows : 1,
    },
    columnToKey : {
      A : 'Compteur',
      B : 'Type',
      C : 'CodeArticle',
      D : 'CodeDepot',
      E : 'Date',
      F : 'Quantite',
      G : 'Valorisation',
      H : 'StockPermanent',
      I : 'QteUtilisee',
      J : 'Soldee',
      K : 'TypeIdentifiant',
      L : 'Identifiant',
      M : 'NumSerie',
      N : 'CodeFseur',
      O : 'CompteurArticle',
      P : 'CodeDevise',
      Q : 'DateDerniereModif',
    },
  });

  const articles = excelToJson({
    sourceFile : files.articles[0].link,
    header : {
      rows : 1,
    },
    columnToKey : {
      A : 'Code',
      C : 'Nom',
    },
  });

  const lots = excelToJson({
    sourceFile : files.lots[0].link,
    header : {
      rows : 1,
    },
    columnToKey : {
      A : 'CodeArticle',
      C : 'NumeroLot',
      G : 'DatePeremption',
    },
  });

  const lotsDoc = excelToJson({
    sourceFile : files.lotsDoc[0].link,
    header : {
      rows : 1,
    },
    columnToKey : {
      A : 'CodeDoc',
      B : 'TypeDoc',
      D : 'CodeArticle',
      E : 'NumeroLot',
      F : 'Quantite',
      H : 'Valorisation',
    },
  });

  const movementsKey = Object.keys(movements)[0];
  movements[movementsKey].forEach(row => {
    const value = {
      depot_uuid : db.bid(depotUuid),
      type : row.Type,
      code_document : row.Identifiant,
      code_article : row.CodeArticle,
      date : row.Date,
      quantite : row.Quantite,
      valorisation : row.Valorisation,
    };
    tx.addQuery('INSERT INTO cdr_reporting_mouvement_stock SET ?', value);
  });

  const articlesKey = Object.keys(articles)[0];
  articles[articlesKey].forEach(row => {
    const value = {
      depot_uuid : db.bid(depotUuid),
      code : row.Code,
      nom : row.Nom,
    };
    tx.addQuery('INSERT INTO cdr_reporting_article SET ?', value);
  });

  const lotsKey = Object.keys(lots)[0];
  lots[lotsKey].forEach(row => {
    const value = {
      depot_uuid : db.bid(depotUuid),
      code_article : row.CodeArticle,
      numero_lot : row.NumeroLot,
      date_peremption : row.DatePeremption,
    };
    tx.addQuery('INSERT INTO cdr_reporting_article_lot SET ?', value);
  });

  const lotsDocKey = Object.keys(lotsDoc)[0];
  lotsDoc[lotsDocKey].forEach(row => {
    const value = {
      depot_uuid : db.bid(depotUuid),
      code_document : row.CodeDoc,
      code_article : row.CodeArticle,
      numero_lot : row.NumeroLot,
      quantite : row.Quantite,
      valorisation : row.Valorisation,
    };
    tx.addQuery('INSERT INTO cdr_reporting_lot_document SET ?', value);
  });

  // create the new depot and related movements
  await tx.execute();

  // set the depot version according its last record movement
  const queryUpdateDepotVersion = 'UPDATE cdr_reporting_depot SET last_movement_date = ? WHERE uuid = ?';
  const queryLastMovement = `
    SELECT ms.date FROM cdr_reporting_mouvement_stock ms 
    WHERE ms.depot_uuid = ?
    ORDER BY ms.date DESC LIMIT 1;
  `;
  const [record] = await db.exec(queryLastMovement, [db.bid(depotUuid)]);
  if (record && record.date) {
    await db.exec(queryUpdateDepotVersion, [record.date, db.bid(depotUuid)]);
  }
}

async function create(req, res, next) {
  try {
    const depotUuid = uuid();
    const { files } = req;
    const params = req.body;

    const newCdrDepot = { uuid : db.bid(depotUuid), text : params.depot.text };
    const queryCreateCdrDepot = 'INSERT INTO cdr_reporting_depot SET ?';

    await db.exec(queryCreateCdrDepot, newCdrDepot);
    await importCdrDepotDataFromFiles(files, depotUuid);

    res.status(201).json({ depot_uuid : depotUuid });
  } catch (e) {
    next(e);
  }
}

async function list(req, res, next) {
  const query = `
    SELECT BUID(uuid) uuid, text, last_movement_date FROM cdr_reporting_depot;
  `;
  try {
    const rows = await db.exec(query);
    res.status(200).json(rows);
  } catch (e) {
    next(e);
  }
}

async function details(req, res, next) {
  try {
    const identifier = req.params.uuid;
    const queryCdrDepot = 'SELECT BUID(uuid) uuid, text, last_movement_date FROM cdr_reporting_depot WHERE uuid = ?';
    const data = await db.one(queryCdrDepot, [db.bid(identifier)]);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const identifier = req.params.uuid;
    const { files } = req;

    await clearCdrDepotData(identifier);
    await importCdrDepotDataFromFiles(files, identifier);

    res.status(201).json({ depot_uuid : identifier });
  } catch (e) {
    next(e);
  }
}

async function remove(req, res, next) {
  try {
    const identifier = req.params.uuid;

    const queryDeleteCdrDepot = 'DELETE FROM cdr_reporting_depot WHERE uuid = ?;';

    await clearCdrDepotData(identifier);

    await db.exec(queryDeleteCdrDepot, [db.bid(identifier)]);

    res.sendStatus(204);
  } catch (e) {
    next(e);
  }
}
