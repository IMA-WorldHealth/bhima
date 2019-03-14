const db = require('../../../../lib/db');
const FilterParser = require('../../../../lib/filter');

module.exports.hospitallization = hospitallization;
module.exports.finances = finances;
module.exports.personel = personel;

async function hospitallization(options) {
  try {

    // get the sum value for each of thoses columns :
    //  total_day_realized, total_hospitalized_patient, total_death, total_beds
    const sql1 = `
      SELECT 
        SUM(IFNULL(hi.total_day_realized, 0)) AS total_day_realized
        SUM(IFNULL(hi.total_hospitalized_patient, 0)) AS total_hospitalized_patient
        SUM(IFNULL(hi.total_death, 0)) AS total_death,
        SUM(IFNULL(hi.total_beds, 0)) AS total_beds,
        p.start_date as period_start
      FROM hospitalization_indicator hi  
      JOIN indicator ind ON ind.uuid = hi.indicator_uuid
      JOIN period p ON p.id = ind.period_id
    `;

    // specific query to get the total_beds number of the last period(according to the date interval)
    const sql2 = `
      SELECT 
        IFNULL(hi.total_beds, 0) AS total_beds
      FROM hospitalization_indicator hi  
      JOIN indicator ind ON ind.uuid = hi.indicator_uuid
      JOIN period p ON p.id = ind.period_id
    `;

    db.convert(options, ['uuid', 'indicator_uuid']);

    // this first filter will be used for the sums query
    let filters1 = new FilterParser(options, { tableAlias : 'hi' });

    // this second filter will be used for the last value query
    let filters2 = new FilterParser(options, { tableAlias : 'hi', limitKey : 1 });

    filters1 = defaultFilters(filters1);
    filters1.equals('service_id');

    filters2 = defaultFilters(filters2);
    filters2.equals('service_id');
    filters2.setOrder('ORDER BY p.start_date DESC');

    // groupByPeriod key specify if it is necessary to group by period
    if (options.groupByPeriod) {
      filters1.setGroup('GROUP BY p.id');
      filters2.setGroup('GROUP BY p.id');
    }
    // sums query
    const data1 = await db.exec(filters1.applyQuery(sql1), filters1.parameters());
    // last value query
    const data2 = await db.exec(filters2.applyQuery(sql2), filters2.parameters());

    return { sums : data1, last : data2 }; // data1 and data2 are arrays
  } catch (error) {
    throw error();
  }
}


async function finances(options) {
  try {

    // get the sum value for each column
    const sql1 = `
      SELECT 
        SUM(IFNULL(fi.total_revenue, 0)) AS total_revenue
        SUM(IFNULL(fi.total_subsidies, 0)) AS total_subsidies
        SUM(IFNULL(fi.total_drugs_sale, 0)) AS total_drugs_sale,
        SUM(IFNULL(fi.total_expenses, 0)) AS total_expenses,
        SUM(IFNULL(fi.total_other_charge, 0)) AS total_other_charge,
        SUM(IFNULL(fi.total_drugs_purchased, 0)) AS total_drugs_purchased,
        SUM(IFNULL(fi.total_staff_charge, 0)) AS total_staff_charge,
        SUM(IFNULL(fi.total_operating_charge, 0)) AS total_operating_charge,
        SUM(IFNULL(fi.total_depreciation, 0)) AS total_depreciation,
        SUM(IFNULL(fi.total_debts, 0)) AS total_debts,
        SUM(IFNULL(fi.total_cash, 0)) AS total_cash,
        SUM(IFNULL(fi.total_stock_value, 0)) AS total_stock_value,
        SUM(IFNULL(fi.total_staff, 0)) AS total_staff,
        p.start_date as period_start
      FROM finances_indicator fi  
      JOIN indicator ind ON ind.uuid = hi.indicator_uuid
      JOIN period p ON p.id = ind.period_id
    `;

    db.convert(options, ['uuid', 'indicator_uuid']);

    // this filter will be used for the sums query
    let filters1 = new FilterParser(options, { tableAlias : 'fi' });

    filters1 = defaultFilters(filters1);

    // groupByPeriod key specify if it is necessary to group by period
    if (options.groupByPeriod) {
      filters1.setGroup('GROUP BY p.id');
    }
    // sums query
    const data1 = await db.exec(filters1.applyQuery(sql1), filters1.parameters());

    return { sums : data1 }; // data1 and data2 are arrays
  } catch (error) {
    throw error();
  }
}


async function personel(options) {
  try {
    // get the sum value for each column
    const sql1 = `
      SELECT 
        SUM(IFNULL(pi.total_beds, 0)) AS total_beds
        SUM(IFNULL(pi.total_doctors, 0)) AS total_doctors
        SUM(IFNULL(pi.total_nurses, 0)) AS total_nurses,
        SUM(IFNULL(pi.total_caregivers, 0)) AS total_caregivers ,
        SUM(IFNULL(pi.total_staff, 0)) AS total_staff,
        SUM(IFNULL(pi.total_external_visit, 0)) AS total_external_visit,
        SUM(IFNULL(pi.total_visit, 0)) AS total_visit,
        SUM(IFNULL(pi.total_surgery_by_doctor, 0)) AS total_surgery_by_doctor,
        SUM(IFNULL(pi.total_day_realized, 0)) AS total_day_realized,
        SUM(IFNULL(pi.total_hospitalized_patient, 0)) AS total_hospitalized_patient
        p.start_date as period_start
      FROM personel_indicator pi  
      JOIN indicator ind ON ind.uuid = hi.indicator_uuid
      JOIN period p ON p.id = ind.period_id
    `;

    // specific query to get the total_doctors, total_nurses, total_staff, total_caregivers
    // number of the last period(according to the date interval)
    const sql2 = `
      SELECT 
        IFNULL(pi.total_doctors, 0) AS total_doctors
        IFNULL(pi.total_nurses, 0) AS total_nurses,
        IFNULL(pi.total_staff, 0) AS total_staff,
        IFNULL(pi.total_caregivers, 0) AS total_caregivers 
      FROM personel_indicator pi 
      JOIN indicator ind ON ind.uuid = pi.indicator_uuid
      JOIN period p ON p.id = ind.period_id
    `;

    db.convert(options, ['uuid', 'indicator_uuid']);

    // this filter will be used for the sums query
    let filters1 = new FilterParser(options, { tableAlias : 'pi' });
    // this second filter will be used for the last value query
    let filters2 = new FilterParser(options, { tableAlias : 'pi', limitKey : 1 });

    filters1 = defaultFilters(filters1);

    filters2 = defaultFilters(filters2);
    filters2.setOrder('ORDER BY p.start_date DESC');

    filters1 = defaultFilters(filters1);

    // groupByPeriod key specify if it is necessary to group by period
    if (options.groupByPeriod) {
      filters1.setGroup('GROUP BY p.id');
      filters2.setGroup('GROUP BY p.id');
    }
    // sums query
    const data1 = await db.exec(filters1.applyQuery(sql1), filters1.parameters());
    // last value query
    const data2 = await db.exec(filters2.applyQuery(sql2), filters2.parameters());

    return { sums : data1, last : data2 }; // data1 and data2 are arrays
  } catch (error) {
    throw error();
  }
}


// add default filters used for every indicator
function defaultFilters(filters) {
  filters.equals('indicator_uuid');
  filters.custom('user_id', 'ind.user_id=?');
  filters.custom('status_id', 'ind.status_id=?');
  filters.custom('period_id', 'ind.period_id=?');
  filters.custom('start_date', 'DATE(p.start_date) >= DATE(?)');
  filters.custom('end_date', 'DATE(p.end_date) <= DATE(?)');
  return filters;
}
