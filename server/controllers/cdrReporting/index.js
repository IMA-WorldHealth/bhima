/**
 * CDR REPORTING END POINT
 */
const _ = require('lodash');
const moment = require('moment');
const router = require('express').Router();
const excelToJson = require('convert-excel-to-json');

const { uuid } = require('../../lib/util');
const upload = require('../../lib/uploader');
const db = require('../../lib/db');
const ReportManager = require('../../lib/ReportManager');

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
router.get('/depots/available_years', getAvailableYears);
router.get('/depots/peremption', getPeremptionReport);
router.get('/depots/peremption/download', getPeremptionReport);
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
      periode : String(moment(new Date(row.Date)).format('YYYY-MM-')).concat('01'),
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

async function getAvailableYears(req, res, next) {
  try {
    const query = 'SELECT DISTINCT YEAR(ms.date) annee FROM cdr_reporting_mouvement_stock ms;';
    const rows = await db.exec(query);
    res.status(200).json(rows);
  } catch (error) {
    next(error);
  }
}

async function getPeremptionReport(req, res, next) {
  const CDR_PEREMPTION_REPORT_TEMPLATE = './server/controllers/cdrReporting/peremption.handlebars';
  try {
    const options = { ...req.query };
    const report = new ReportManager(CDR_PEREMPTION_REPORT_TEMPLATE, req.session, options);

    if (options.recompute) {
      await processAggregatedValues(options.year);
    }

    const depots = await getDepots();

    const rows = await loadAggregatedValues(options.year);

    const vars = getVariables(rows);

    const quarterVars = getVariables(rows, 'quarter');

    const semestreVars = getVariables(rows, 'semestre');

    const data = {
      year : options.year,
      rows,
      depots,
      vars,
      quarterVars,
      semestreVars,
      quarterPeriods : [1, 2, 3, 4],
      quarterLabels : getQuarterPeriods(),
      semestrePeriods : [1, 2],
      semestreLabels : getSemestrePeriods(),
    };

    const result = await report.render(data);
    res.set(result.headers).send(result.report);
  } catch (error) {
    next(error);
  }
}

async function loadAggregatedValues(year) {
  const query = `
    SELECT 
      d.text, agg.periode, agg.expired_distributed, agg.stock_at_period,
      agg.peremption_rate, agg.quarter, agg.semestre,
      agg.expired_distributed_quarter, agg.expired_distributed_semestre,
      agg.peremption_rate_quarter, agg.peremption_rate_semestre
    FROM cdr_reporting_aggregated_stock agg
    JOIN cdr_reporting_depot d ON d.uuid = agg.depot_uuid
    WHERE YEAR(agg.periode) = ?
    ORDER BY agg.periode;
  `;
  return db.exec(query, [year]);
}

// eslint-disable-next-line no-unused-vars
async function processAggregatedValues(year) {
  const periods = getPeriods(year);
  const depots = await getDepots();
  const dbPromise = [];
  const quarterMonths = [3, 6, 9, 12];
  const semestreMonths = [6, 12];
  let quarterExpiredDistributed = { stock : 0 };
  let semestreExpiredDistributed = { stock : 0 };
  let quarterPeremptionRate = 0;
  let semestrePeremptionRate = 0;

  const queryCleanAggregatedStock = `
    DELETE FROM cdr_reporting_aggregated_stock WHERE YEAR(periode) = ?;
  `;
  await db.exec(queryCleanAggregatedStock, [year]);

  for (let index = 0; index < depots.length; index++) {
    const d = depots[index];

    for (let j = 0; j < periods.length; j++) {
      const p = periods[j];

      const queryStockAtPeriod = `
        SELECT SUM(z.stock) stock
        FROM (
          (
            SELECT IFNULL(SUM(IF(ms.type = 'S', -1 * ms.valorisation, ms.valorisation)), 0) stock
            FROM cdr_reporting_mouvement_stock ms 
            WHERE ms.depot_uuid = ? AND ms.date < LAST_DAY(?)
          ) UNION ALL
          (
            SELECT IFNULL(SUM(ms.valorisation), 0) stock
            FROM cdr_reporting_mouvement_stock ms 
            WHERE ms.depot_uuid = ?
              AND ms.date >= DATE_SUB(?,INTERVAL DAYOFMONTH(?)-1 DAY)
                AND ms.date <= LAST_DAY(?) and type = 'S'
          )
        )z
      `;
      // eslint-disable-next-line no-await-in-loop
      const [stockAtPeriod] = await db.exec(queryStockAtPeriod, [db.bid(d.uuid), p, db.bid(d.uuid), p, p, p]);

      const queryExpiredDistributed = `
      SELECT 
        IFNULL(SUM(ll.valorisation), 0) stock 
      FROM cdr_reporting_mouvement_stock ms
      JOIN cdr_reporting_lot_document ll ON ll.code_document = ms.code_document 
      JOIN cdr_reporting_article_lot al
        ON al.code_article = ll.code_article AND al.numero_lot = ll.numero_lot
      JOIN cdr_reporting_depot crd ON crd.uuid = ms.depot_uuid 
      WHERE ms.depot_uuid = ? AND al.date_peremption < ?
        AND ms.date >= DATE_SUB(?, INTERVAL DAYOFMONTH(?)-1 DAY)
          AND ms.date <= LAST_DAY(?) and type = "S"
      `;
      // eslint-disable-next-line no-await-in-loop
      const [expiredDistributed] = await db.exec(queryExpiredDistributed, [db.bid(d.uuid), p, p, p, p]);

      const peremptionRate = stockAtPeriod.stock ? expiredDistributed.stock / stockAtPeriod.stock : 0;

      const month = p.getMonth() + 1;

      const quarter = Math.ceil(month / 3);

      const semestre = Math.ceil(month / 6);

      if (quarterMonths.includes(month)) {
        const quarterLimit = getDatesFromQuarter(year, month);
        // compute quarter values
        const queryQuarterExpiredDistributed = `
        SELECT 
          IFNULL(SUM(ll.valorisation), 0) stock 
        FROM cdr_reporting_mouvement_stock ms
        JOIN cdr_reporting_lot_document ll ON ll.code_document = ms.code_document 
        JOIN cdr_reporting_article_lot al
          ON al.code_article = ll.code_article AND al.numero_lot = ll.numero_lot
        JOIN cdr_reporting_depot crd ON crd.uuid = ms.depot_uuid 
        WHERE ms.depot_uuid = ? AND al.date_peremption < DATE(?)
          AND ms.date >= DATE(?)
            AND ms.date <= DATE(?) and type = "S"
        `;
        // eslint-disable-next-line no-await-in-loop
        [quarterExpiredDistributed] = await db.exec(
          queryQuarterExpiredDistributed, [
            db.bid(d.uuid), quarterLimit.dateFrom, quarterLimit.dateFrom, quarterLimit.dateTo,
          ],
        );

        quarterPeremptionRate = stockAtPeriod.stock ? quarterExpiredDistributed.stock / stockAtPeriod.stock : 0;
      }

      if (semestreMonths.includes(month)) {
        const semestreLimit = getDatesFromSemestre(year, month);
        // compute quarter values
        const querySemestreExpiredDistributed = `
        SELECT 
          IFNULL(SUM(ll.valorisation), 0) stock 
        FROM cdr_reporting_mouvement_stock ms
        JOIN cdr_reporting_lot_document ll ON ll.code_document = ms.code_document 
        JOIN cdr_reporting_article_lot al
          ON al.code_article = ll.code_article AND al.numero_lot = ll.numero_lot
        JOIN cdr_reporting_depot crd ON crd.uuid = ms.depot_uuid 
        WHERE ms.depot_uuid = ? AND al.date_peremption < DATE(?)
          AND ms.date >= DATE(?)
            AND ms.date <= DATE(?) and type = "S"
        `;
        // eslint-disable-next-line no-await-in-loop
        [semestreExpiredDistributed] = await db.exec(
          querySemestreExpiredDistributed, [
            db.bid(d.uuid), semestreLimit.dateFrom, semestreLimit.dateFrom, semestreLimit.dateTo,
          ],
        );

        semestrePeremptionRate = stockAtPeriod.stock ? semestreExpiredDistributed.stock / stockAtPeriod.stock : 0;
      }

      const write = {
        depot_uuid : db.bid(d.uuid),
        expired_distributed : expiredDistributed.stock,
        stock_at_period : stockAtPeriod.stock,
        peremption_rate : peremptionRate,
        periode : new Date(p),
        expired_distributed_quarter : quarterExpiredDistributed.stock,
        peremption_rate_quarter : quarterPeremptionRate,
        expired_distributed_semestre : semestreExpiredDistributed.stock,
        peremption_rate_semestre : semestrePeremptionRate,
        quarter,
        semestre,
      };

      const queryInsertAggregatedStock = `
        INSERT INTO cdr_reporting_aggregated_stock SET ?;
      `;

      dbPromise.push(db.exec(queryInsertAggregatedStock, [write]));
    }
  }
  return Promise.all(dbPromise);
}

function getVariables(rows, groupingKey = 'periodeKey') {
  const dataset = rows.map(item => {
    item.periodeKey = moment(item.periode).format('YYYY-MM-DD');
    return item;
  });
  const periods = _.groupBy(dataset, groupingKey);
  const expiredDistributed = {};
  const stockAtPeriod = {};
  const peremptionRate = {};
  const totalExpiredDistributed = {};
  const totalStockAtPeriod = {};
  const totalRate = {};

  const rangeStockAtPeriod = {};
  const rangePeremptionRate = {};
  const rangeTotalExpiredDistributed = {};
  const rangeTotalStockAtPeriod = {};
  const rangeTotalPeremptionRate = {};

  const periodForQuarter = {
    1 : 3, 2 : 6, 3 : 9, 4 : 12,
  };

  const periodForSemestre = {
    1 : 6, 2 : 12,
  };

  Object.keys(periods).forEach((periodKey, index, theArray) => {
    expiredDistributed[periodKey] = {};
    stockAtPeriod[periodKey] = {};
    peremptionRate[periodKey] = {};
    rangeStockAtPeriod[periodKey] = {};
    rangePeremptionRate[periodKey] = {};

    rangeTotalExpiredDistributed[periodKey] = 0;
    rangeTotalStockAtPeriod[periodKey] = 0;
    rangeTotalPeremptionRate[periodKey] = 0;

    const depotsData = _.groupBy(periods[periodKey], 'text');

    Object.keys(depotsData).forEach(depotKey => {
      expiredDistributed[periodKey][depotKey] = _.sumBy(depotsData[depotKey], 'expired_distributed');
      stockAtPeriod[periodKey][depotKey] = _.sumBy(depotsData[depotKey], 'stock_at_period');
      peremptionRate[periodKey][depotKey] = _.sumBy(depotsData[depotKey], 'peremption_rate');

      let rangeData = 0;
      if (theArray.length === 4) {
        rangeData = depotsData[depotKey]
          .filter(item => item.periode.getMonth() + 1 === periodForQuarter[periodKey]);
      } else if (theArray.length === 2) {
        rangeData = depotsData[depotKey]
          .filter(item => item.periode.getMonth() + 1 === periodForSemestre[periodKey]);
      }

      rangeStockAtPeriod[periodKey][depotKey] = _.sumBy(rangeData, 'stock_at_period');
      rangePeremptionRate[periodKey][depotKey] = rangeStockAtPeriod[periodKey][depotKey]
        ? (expiredDistributed[periodKey][depotKey] / rangeStockAtPeriod[periodKey][depotKey]) : 0;

      rangeTotalStockAtPeriod[periodKey] += rangeStockAtPeriod[periodKey][depotKey];
      rangeTotalExpiredDistributed[periodKey] += expiredDistributed[periodKey][depotKey];
    });

    totalExpiredDistributed[periodKey] = _.sumBy(periods[periodKey], 'expired_distributed');
    totalStockAtPeriod[periodKey] = _.sumBy(periods[periodKey], 'stock_at_period');
    totalRate[periodKey] = totalStockAtPeriod[periodKey]
      ? totalExpiredDistributed[periodKey] / totalStockAtPeriod[periodKey] : 0;

    rangeTotalPeremptionRate[periodKey] = rangeTotalStockAtPeriod[periodKey]
      ? rangeTotalExpiredDistributed[periodKey] / rangeTotalStockAtPeriod[periodKey] : 0;
  });

  return {
    periods,
    totalExpiredDistributed,
    totalStockAtPeriod,
    totalRate,
    expiredDistributed,
    stockAtPeriod,
    peremptionRate,
    rangeStockAtPeriod,
    rangePeremptionRate,
    rangeTotalStockAtPeriod,
    rangeTotalExpiredDistributed,
    rangeTotalPeremptionRate,
  };
}

function getPeriods(year) {
  const periods = [...Array(12)];
  return periods.map((item, index) => new Date(`${(index + 1) < 10 ? '0'.concat(index + 1) : index + 1}-01-${year}`));
}

function getQuarterPeriods() {
  return {
    1 : 'Trimestre 1',
    2 : 'Trimestre 2',
    3 : 'Trimestre 3',
    4 : 'Trimestre 4',
  };
}

function getSemestrePeriods() {
  return {
    1 : 'Semestre 1',
    2 : 'Semestre 2',
  };
}

function getDatesFromQuarter(year, quarter) {
  const map = {
    3 : { dateFrom : new Date(`${year}-01-01`), dateTo : new Date(`${year}-03-31`) },
    6 : { dateFrom : new Date(`${year}-04-01`), dateTo : new Date(`${year}-06-30`) },
    9 : { dateFrom : new Date(`${year}-07-01`), dateTo : new Date(`${year}-09-30`) },
    12 : { dateFrom : new Date(`${year}-08-01`), dateTo : new Date(`${year}-12-31`) },
  };
  return map[quarter];
}

function getDatesFromSemestre(year, semestre) {
  const map = {
    6 : { dateFrom : new Date(`${year}-01-01`), dateTo : new Date(`${year}-06-30`) },
    12 : { dateFrom : new Date(`${year}-07-01`), dateTo : new Date(`${year}-12-31`) },
  };
  return map[semestre];
}

async function getDepots() {
  const queryCdrDepots = 'SELECT BUID(uuid) uuid, text FROM cdr_reporting_depot;';
  return db.exec(queryCdrDepots);
}
