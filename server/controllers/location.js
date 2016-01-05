var db = require('../lib/db');

/* The Location API
*
* routes:
*   /location/villages
*   /location/sectors
*   /location/provinces
*   /location/village/:uuid
*   /location/sector/:uuid
*   /location/province/:uuid
*   /location/detail/:uuid
*
* Each endpoint returns a table with all information available.
* Endpoints taking UUIDs return only the records matching the UUID
*/

// HTTP Controllers
exports.allVillages = function (req, res, next) {
  var sql =
    'SELECT village.uuid, village.name, sector.name as sector_name, sector.uuid as sector_uuid, ' +
      'province.name as province_name, country.country_en as country_name ' +
    'FROM village JOIN sector JOIN province JOIN country ON ' +
      'village.sector_uuid = sector.uuid AND ' +
      'sector.province_uuid = province.uuid AND ' +
      'province.country_uuid = country.uuid ' +
      'ORDER BY country_name ASC, province.name ASC, village.name ASC;';

  db.exec(sql)
  .then(function (data) {
    res.send(data);
  })
  .catch(next)
  .done();
};

exports.allSectors = function (req, res, next) {
  var sql =
    'SELECT sector.uuid, sector.name, ' +
      'province.name as province_name, province.uuid as province_uuid, country.country_en as country_name ' +
    'FROM sector JOIN province JOIN country ON ' +
      'sector.province_uuid = province.uuid AND ' +
      'province.country_uuid = country.uuid;';

  db.exec(sql)
  .then(function (data) {
    res.send(data);
  })
  .catch(next)
  .done();
};

exports.allProvinces = function (req, res, next) {
  var sql =
    'SELECT province.uuid, province.name, country.country_en as country_name, country.uuid as country_uuid ' +
    'FROM province JOIN country ON ' +
      'province.country_uuid = country.uuid;';

  db.exec(sql)
  .then(function (data) {
    res.send(data);
  })
  .catch(next)
  .done();
};

exports.lookupVillage = function (req, res, next) {
  var sql =
    'SELECT village.uuid, village.name, sector.name as sector_name, sector.uuid as sector_uuid, ' +
    'province.name as province_name, country.country_en as country_name ' +
    'FROM village JOIN sector JOIN province JOIN country ON ' +
      'village.sector_uuid = sector.uuid AND ' +
      'sector.province_uuid = province.uuid AND ' +
      'province.country_uuid = country.uuid ' +
    'WHERE village.uuid = ?;';

  db.exec(sql, [req.params.uuid])
  .then(function (data) {
    res.send(data);
  })
  .catch(next)
  .done();
};

exports.lookupSector = function (req, res, next) {
  var sql =
    'SELECT sector.uuid, sector.name, ' +
      'province.name as province_name, country.country_en as country_name ' +
    'FROM sector JOIN province JOIN country ON ' +
      'sector.province_uuid = province.uuid AND ' +
      'province.country_uuid = country.uuid ' +
    'WHERE sector.uuid = ?;';

  db.exec(sql, [req.params.uuid])
  .then(function (data) {
    res.send(data);
  })
  .catch(next)
  .done();
};

exports.lookupProvince = function (req, res, next) {
  var sql =
    'SELECT province.uuid, province.name, country.country_en as country_name ' +
    'FROM province JOIN country ON ' +
      'province.country_uuid = country.uuid ' +
    'WHERE province.uuid = ?;';

  db.exec(sql, [req.params.uuid])
  .then(function (data) {
    res.send(data);
  })
  .catch(next)
  .done();
};

// TODO use exec templating '?' vs. string concatination
exports.lookupDetail = function (req, res, next) {
  var specifyVillage = req.params.uuid ? ' AND `village`.`uuid`=\'' + req.params.uuid + '\'' : '';

  var sql =
    'SELECT `village`.`uuid` as `uuid`, village.uuid as village_uuid, `village`.`name` as `village`, ' +
      '`sector`.`name` as `sector`, sector.uuid as sector_uuid, `province`.`name` as `province`, province.uuid as province_uuid, ' +
      '`country`.`country_en` as `country`, country.uuid as country_uuid ' +
    'FROM `village`, `sector`, `province`, `country` ' +
    'WHERE village.sector_uuid = sector.uuid AND ' +
      'sector.province_uuid = province.uuid AND ' +
      'province.country_uuid=country.uuid ' + specifyVillage + ';';

  db.exec(sql)
  .then(function (rows) {
    res.send(rows);
  })
  .catch(next)
  .done();
};
