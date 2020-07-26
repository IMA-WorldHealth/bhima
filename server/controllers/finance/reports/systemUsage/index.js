const _ = require('lodash');
const db = require('../../../../lib/db');
const ReportManager = require('../../../../lib/ReportManager');

const TEMPLATE = './server/controllers/finance/reports/systemUsage/system.usage.handlebars';

const DEFAULT_PARAMS = {
  csvKey : 'rows',
  filename : 'REPORT.SYSTEM_USAGE_STAT.TITLE',
  orientation : 'landscape',
};
// expose to the API
exports.document = document;

async function document(req, res, next) {
  try {
    const options = _.defaults(req.query, DEFAULT_PARAMS);
    const report = new ReportManager(TEMPLATE, req.session, options);
    const { date } = req.query;

    const patientsNbr = `
      SELECT HOUR(created_at) as 'hour', COUNT(patient.uuid) as 'number'
      FROM patient
      WHERE DATE(created_at) = DATE(?)
      GROUP BY HOUR(created_at)
    `;

    const invoicesNbr = `
      SELECT HOUR(created_at)  as 'hour', COUNT(invoice.uuid) as 'number'
      FROM invoice
      WHERE DATE(created_at) = DATE(?)
      GROUP BY HOUR(created_at)
    `;

    const cashNbr = `
      SELECT HOUR(created_at)  as 'hour', COUNT(cash.uuid) as 'number'
      FROM cash
      WHERE DATE(created_at) = DATE(?)
      GROUP BY HOUR(created_at)
    `;

    const [
      patients,
      invoices,
      cashPayments,
    ] = await Promise.all([
      db.exec(patientsNbr, date),
      db.exec(invoicesNbr, date),
      db.exec(cashNbr, date),
    ]);

    const patientMap = _.groupBy(patients, 'hour');
    const cashPaymentMap = _.groupBy(cashPayments, 'hour');
    const invoicesMap = _.groupBy(invoices, 'hour');

    const pivot = [];

    for (let i = 0; i < 25; i++) {
      const index = `${i}`;
      const row = {
        hour : index, patients : 0, invoices : 0, cashPayments : 0,
      };

      if (patientMap[index]) {
        row.patients = patientMap[index][0].number;
      }

      if (invoicesMap[index]) {
        row.invoices = invoicesMap[index][0].number;
      }

      if (cashPaymentMap[index]) {
        row.cashPayments = cashPaymentMap[index][0].number;
      }

      pivot.push(row);
    }

    const cleaned = pivot.filter(row => (row.patients + row.invoices + row.cashPayments > 0));

    const result = await report.render({
      statDate : date,
      pivot : cleaned,
    });

    res.set(result.headers).send(result.report);
  } catch (e) {
    next(e);
  }
}
