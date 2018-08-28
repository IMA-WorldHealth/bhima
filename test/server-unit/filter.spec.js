const { expect } = require('chai');
const _ = require('lodash');

const filter = require('../../server/lib/filter');

const object1 = {
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
  dateFrom : '1960-06-30',
  dateTo : '1997-05-17',
};

const object2 = {
  id : 1,
  label : 'PROFIT',
  number : 7001010,
  dateCentury : '2000-01-01',
  limit : 3,
  period : 'week',
};

const object3 = {
  id : 1,
  abbr : 'js',
  display_name : 'javascript',
};

const object4 = {
  grade_uuid : 'c8a406a953d6429f84d8fc497875a580',
  grade : 'Lieutenant-général',
};

describe('filter.js', () => {
  
  it('#fullText Format the sql query when filtered by full text', () => {
    const filters = new filter(object1, { tableAlias : 't' });
    filters.fullText('name');
    const sql = `SELECT t.id, t.name, t.date_object, t.value, t.country_id FROM tables AS t`;

    const formated = filters.applyQuery(sql).trim();
    const expected = `SELECT t.id, t.name, t.date_object, t.value, t.country_id FROM tables AS t WHERE LOWER(t.name) LIKE ?`;
    expect(formated).to.equal(expected);
  });

  it('#period Format the sql query when filtered by Period', () => {
    const filters = new filter(object1, { tableAlias : 't' });
    filters.period('period', 'date_object');
    const sql = `SELECT t.id, t.name, t.date_object, t.value, t.country_id FROM tables AS t`;
    const expected = `SELECT t.id, t.name, t.date_object, t.value, t.country_id FROM tables AS t WHERE DATE(t.date_object) >= DATE(?) AND DATE(t.date_object) <= DATE(?)`;

    const formated = filters.applyQuery(sql).trim();
    expect(formated).to.equal(expected);
  });

  it('#dateFrom Format the sql query when filtered by dateFrom', () => {
    const filters = new filter(object1, { tableAlias : 't' });
    filters.dateFrom('date_object');
    const sql = `SELECT t.id, t.name, t.date_object, t.value, t.country_id FROM tables AS t`;
    const expected = `SELECT t.id, t.name, t.date_object, t.value, t.country_id FROM tables AS t WHERE DATE(t.date_object) >= DATE(?)`;

    const formated = filters.applyQuery(sql).trim();
    expect(formated).to.equal(expected);
  });

  it('#dateTo Format the sql query when filtered by dateTo', () => {
    const filters = new filter(object1, { tableAlias : 't' });
    filters.dateTo('date_object');
    const sql = `SELECT t.id, t.name, t.date_object, t.value, t.country_id FROM tables AS t`;
    const expected = `SELECT t.id, t.name, t.date_object, t.value, t.country_id FROM tables AS t WHERE DATE(t.date_object) <= DATE(?)`;

    const formated = filters.applyQuery(sql).trim();
    expect(formated).to.equal(expected);
  });

  it('#dateFrom and #dateTo Format the sql query when filtered by date range', () => {
    const filters = new filter(object1, { tableAlias : 't' });
    filters.dateFrom('dateFrom', 'date_object');
    filters.dateTo('dateTo', 'date_object');
    const sql = `SELECT t.id, t.name, t.date_object, t.value, t.country_id FROM tables AS t`;
    const expected = `SELECT t.id, t.name, t.date_object, t.value, t.country_id FROM tables AS t WHERE DATE(t.date_object) >= DATE(?) AND DATE(t.date_object) <= DATE(?)`;
    
    const formated = filters.applyQuery(sql).trim();
    expect(formated).to.equal(expected);
  });

  it('#equals Format the sql query when filtered by equals', () => {
    const filters = new filter(object1, { tableAlias : 't' });
    filters.equals('value');
    const sql = `SELECT t.id, t.name, t.date_object, t.value, t.country_id FROM tables AS t`;
    const expected = `SELECT t.id, t.name, t.date_object, t.value, t.country_id FROM tables AS t WHERE t.value = ?`;

    const formated = filters.applyQuery(sql).trim();
    expect(formated).to.equal(expected);
  });

  it('#custom Format the sql query when filtered by custom', () => {
    const filters = new filter(object1, { tableAlias : 't' });
    filters.custom('list', 't.id IN (?)', [object1.list]);

    const sql = `SELECT t.id, t.name, t.date_object, t.value, t.country_id FROM tables AS t`;
    const expected = `SELECT t.id, t.name, t.date_object, t.value, t.country_id FROM tables AS t WHERE t.id IN (?)`;

    const formated = filters.applyQuery(sql).trim();
    expect(formated).to.equal(expected);
  });

  it('#customMultiParameters Format the sql query when filtered by customMultiParameters', () => {
    const filters = new filter(object1, { tableAlias : 'g' });
    const params = ['Kinshasa', 'Kinshasa', 'Kinshasa'];
    const sql = `SELECT g.id, g.street, g.town, g.country, g.location FROM geographic AS g`;
    const geographicSql = `(g.street LIKE ?) OR (g.town LIKE ?) OR (g.country LIKE ?)`;
    const expected = `SELECT g.id, g.street, g.town, g.country, g.location FROM geographic AS g WHERE (g.street LIKE ?) OR (g.town LIKE ?) OR (g.country LIKE ?)`;

    filters.custom('location', geographicSql, params);
    const formated = filters.applyQuery(sql).trim();

    expect(formated).to.equal(expected);
  });

  it('Format the sql query when Set ORDER BY AND GROUP BY', () => {
    const filters = new filter(object1, { tableAlias : 't' });
    filters.setOrder('ORDER BY t.name');
    filters.setGroup('GROUP BY t.country_id');

    const sql = `SELECT t.id, t.name, t.date_object, t.value, t.country_id FROM tables AS t`;
    const expected = `SELECT t.id, t.name, t.date_object, t.value, t.country_id FROM tables AS t WHERE 1 GROUP BY t.country_id ORDER BY t.name`;

    const formated = filters.applyQuery(sql).trim();
    expect(formated).to.equal(expected);
  });

  it('#fullText Format the sql query when filtered by full text, by Period and Limited number of rows', () => {
    const filters = new filter(object2, { tableAlias : 'a' });
    filters.fullText('label');
    filters.period('period', 'date_century');
    const sql = `SELECT a.id, a.label, a.number, a.dateCentury FROM accounts AS a`;

    const formated = filters.applyQuery(sql).trim();
    const expected = `SELECT a.id, a.label, a.number, a.dateCentury FROM accounts AS a WHERE LOWER(a.label) LIKE ?  AND DATE(a.date_century) >= DATE(?) AND DATE(a.date_century) <= DATE(?)   LIMIT 3`;
    expect(formated).to.equal(expected);
  });

  it('#Test a query with autoParseStatments with autoParseStatments is true.', () => {
    const filters = new filter(object3, { tableAlias : 'j' , autoParseStatements : true});
    const sql = `SELECT j.id, j.abbr, j.display_name FROM javascript AS j`;
    const formated = filters.applyQuery(sql).trim();

    const expected = `SELECT j.id, j.abbr, j.display_name FROM javascript AS j WHERE j.id = ? AND j.abbr = ? AND j.display_name = ?`;
    expect(formated).to.equal(expected);
  });

  it('Format the SQL when Parsed Automatically Uuid.', () => {
    const filters = new filter(object4, { tableAlias : 'g' , autoParseStatements : true});
    const sql = `SELECT g.grade_uuid, g.grade FROM grade AS g`;
    const formated = filters.applyQuery(sql).trim();

    const expected = `SELECT g.grade_uuid, g.grade FROM grade AS g WHERE g.grade_uuid = HUID(?) AND g.grade = ?`;
    expect(formated).to.equal(expected);
  });
});
