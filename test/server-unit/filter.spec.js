const { expect } = require('chai');
const _ = require('lodash');

const filter = require('../../server/lib/filter');

const objects = {
  id : 1,
  name : 'Unit Test',
  date_object : '1960-06-30',
  value : '1000000',
  list : [1, 2, 3],
  country_id : 243,
  period : 'month',
  country : 'dr congo',
  town : 'Kinshasa',
  street : 'Sgt Moke',
  location : 'Safricas / Sgt Moke/ Kinshasa / DR Congo',
};

const accounts = {
  id : 1,
  label : 'PROFIT',
  number : 7001010,
  dateCentury : '2000-01-01',
  limit : 3,
  period : 'week',
};

describe('filter.js', () => {
  it('#fullText Format the sql query when filtered by full text', () => {
    const filters = new filter(objects, { tableAlias : 't' });
    filters.fullText('name');
    const sql = `SELECT t.id, t.name, t.date_object, t.value, t.country_id FROM tables AS t`;

    const formated = filters.applyQuery(sql).trim();
    const expected = `SELECT t.id, t.name, t.date_object, t.value, t.country_id FROM tables AS t WHERE LOWER(t.name) LIKE ?`;
    expect(formated).to.equal(expected);
  });

  it('#period Format the sql query when filtered by Period', () => {
    const filters = new filter(objects, { tableAlias : 't' });
    filters.period('period', 'date_object');
    const sql = `SELECT t.id, t.name, t.date_object, t.value, t.country_id FROM tables AS t`;
    const expected = `SELECT t.id, t.name, t.date_object, t.value, t.country_id FROM tables AS t WHERE DATE(t.date_object) >= DATE(?) AND DATE(t.date_object) <= DATE(?)`;

    const formated = filters.applyQuery(sql).trim();
    expect(formated).to.equal(expected);
  });

  it('#dateFrom Format the sql query when filtered by dateFrom', () => {
    const filters = new filter(objects, { tableAlias : 't' });
    filters.dateFrom('date_object');
    const sql = `SELECT t.id, t.name, t.date_object, t.value, t.country_id FROM tables AS t`;
    const expected = `SELECT t.id, t.name, t.date_object, t.value, t.country_id FROM tables AS t WHERE DATE(t.date_object) >= DATE(?)`;

    const formated = filters.applyQuery(sql).trim();
    expect(formated).to.equal(expected);
  });

  it('#dateTo Format the sql query when filtered by dateTo', () => {
    const filters = new filter(objects, { tableAlias : 't' });
    filters.dateTo('date_object');
    const sql = `SELECT t.id, t.name, t.date_object, t.value, t.country_id FROM tables AS t`;
    const expected = `SELECT t.id, t.name, t.date_object, t.value, t.country_id FROM tables AS t WHERE DATE(t.date_object) <= DATE(?)`;

    const formated = filters.applyQuery(sql).trim();
    expect(formated).to.equal(expected);
  });

  it('#equals Format the sql query when filtered by equals', () => {
    const filters = new filter(objects, { tableAlias : 't' });
    filters.equals('value');
    const sql = `SELECT t.id, t.name, t.date_object, t.value, t.country_id FROM tables AS t`;
    const expected = `SELECT t.id, t.name, t.date_object, t.value, t.country_id FROM tables AS t WHERE t.value = ?`;

    const formated = filters.applyQuery(sql).trim();
    expect(formated).to.equal(expected);
  });

  it('#custom Format the sql query when filtered by custom', () => {
    const filters = new filter(objects, { tableAlias : 't' });
    filters.custom('list', 't.id IN (?)', [objects.list]);

    const sql = `SELECT t.id, t.name, t.date_object, t.value, t.country_id FROM tables AS t`;
    const expected = `SELECT t.id, t.name, t.date_object, t.value, t.country_id FROM tables AS t WHERE t.id IN (?)`;

    const formated = filters.applyQuery(sql).trim();
    expect(formated).to.equal(expected);
  });

  it('#customMultiParameters Format the sql query when filtered by customMultiParameters', () => {
    const filters = new filter(objects, { tableAlias : 'g' });
    const params = ['Kinshasa', 'Kinshasa', 'Kinshasa'];
    const sql = `SELECT g.id, g.street, g.town, g.country, g.location FROM geographic AS g`;
    const geographicSql = `(g.street LIKE ?) OR (g.town LIKE ?) OR (g.country LIKE ?)`;
    const expected = `SELECT g.id, g.street, g.town, g.country, g.location FROM geographic AS g WHERE (g.street LIKE ?) OR (g.town LIKE ?) OR (g.country LIKE ?)`;

    filters.custom('location', geographicSql, params);
    const formated = filters.applyQuery(sql).trim();

    expect(formated).to.equal(expected);
  });

  it('Format the sql query when Set ORDER BY AND GROUP BY', () => {
    const filters = new filter(objects, { tableAlias : 't' });
    filters.setOrder('ORDER BY t.name');
    filters.setGroup('GROUP BY t.country_id');

    const sql = `SELECT t.id, t.name, t.date_object, t.value, t.country_id FROM tables AS t`;
    const expected = `SELECT t.id, t.name, t.date_object, t.value, t.country_id FROM tables AS t WHERE 1 GROUP BY t.country_id ORDER BY t.name`;

    const formated = filters.applyQuery(sql).trim();
    expect(formated).to.equal(expected);
  });

  it('#fullText Format the sql query when filtered by full text, by Period and Limited number of rows', () => {
    const filters = new filter(accounts, { tableAlias : 'a' });
    filters.fullText('label');
    filters.period('period', 'date_century');
    const sql = `SELECT a.id, a.label, a.number, a.dateCentury FROM acconts AS a`;

    const formated = filters.applyQuery(sql).trim();
    const expected = `SELECT a.id, a.label, a.number, a.dateCentury FROM acconts AS a WHERE LOWER(a.label) LIKE ?  AND DATE(a.date_century) >= DATE(?) AND DATE(a.date_century) <= DATE(?)   LIMIT 3`;
    expect(formated).to.equal(expected);
  });
});
