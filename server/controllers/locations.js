var db = require('../lib/db');

/* The Location API
*
* routes:
*   /locations/villages
*   /locations/sectors
*   /locations/provinces
*   /locations/village/:uuid
*   /locations/sector/:uuid
*   /locations/province/:uuid
*   /locations/detail/:uuid
*
* Each endpoint returns a table with all information available.
* Endpoints taking UUIDs return only the records matching the UUID
*/

/**
 * GET /locations/villages
 *
 * This method lists all the villages from the database.
 *
 * Query Parameters:
 *  ?sector={uuid}
 *
 * @method villages
 * @return {array} an array of (uuid, name)
 */
exports.villages = function villages(req, res, next) {
  'use strict';

  var sql =
    'SELECT village.uuid, village.name FROM village ';

  sql += (req.query.sector) ?
    'WHERE village.sector_uuid = ? ORDER BY village.name ASC;' :
    'ORDER BY village.name ASC;';

  db.exec(sql, [ req.query.sector ])
  .then(function (data) {
    res.status(200).json(data);
  })
  .catch(next)
  .done();
};

/**
 * GET /locations/sectors
 *
 * This method lists all the sectors in the database.
 *
 * Query Parameters:
 *  ?province={uuid}
 *
 * @method sectors
 * @return {array} an array of (uuid, name)
 */
exports.sectors = function sectors(req, res, next) {
  'use strict';

  var sql =
    'SELECT sector.uuid, sector.name FROM sector ';

  sql += (req.query.province) ?
    'WHERE sector.province_uuid = ? ORDER BY sector.name ASC;' :
    'ORDER BY sector.name ASC;';

  db.exec(sql, [ req.query.province ])
  .then(function (data) {
    res.status(200).json(data);
  })
  .catch(next)
  .done();
};

/**
 * GET /locations/provinces
 *
 * This method lists all the provinces in the database.
 *
 * Query Parameters:
 *  ?country={uuid}
 *
 * @method provinces
 * @return {array} an array of (uuid, name)
 */
exports.provinces = function provinces(req, res, next) {
  'use strict';

  var sql =
    'SELECT province.uuid, province.name FROM province ';

  sql += (req.query.country) ?
    'WHERE province.country_uuid = ? ORDER BY province.name ASC;' :
    'ORDER BY province.name ASC;';

  db.exec(sql, [ req.query.country ])
  .then(function (data) {
    res.status(200).json(data);
  })
  .catch(next)
  .done();
};

/**
 * GET /locations/countries
 *
 * This method lists all the countries in the database.
 *
 * @method countries
 * @return {array} an array of (uuid, name)
 */
exports.countries = function countries(req, res, next) {
  'use strict';

  var sql =
    'SELECT country.uuid, country.country_en AS name FROM country;';

  db.exec(sql)
  .then(function (data) {
    res.status(200).json(data);
  })
  .catch(next)
  .done();
};

/** @todo - should this method even be called? */
exports.lookupVillage = function lookupVillage(req, res, next) {
  'use strict';

  var sql =
    'SELECT village.uuid, village.name, sector.name AS sector_name, sector.uuid AS sector_uuid, ' +
    'province.name AS province_name, country.country_en AS country_name ' +
    'FROM village JOIN sector JOIN province JOIN country ON ' +
      'village.sector_uuid = sector.uuid AND ' +
      'sector.province_uuid = province.uuid AND ' +
      'province.country_uuid = country.uuid ' +
    'WHERE village.uuid = ?;';

  db.exec(sql, [req.params.uuid])
  .then(function (data) {
    res.status(200).json(data);
  })
  .catch(next)
  .done();
};

/** @todo - should this method even be called? */
exports.lookupSector = function lookupSector(req, res, next) {
  'use strict';

  var sql =
    'SELECT sector.uuid, sector.name, ' +
      'province.name AS province_name, country.country_en AS country_name ' +
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

exports.lookupProvince = function lookupProvince(req, res, next) {
  'use strict';

  var sql =
    'SELECT province.uuid, province.name, country.country_en AS country_name ' +
    'FROM province JOIN country ON ' +
      'province.country_uuid = country.uuid ' +
    'WHERE province.uuid = ?;';

  db.exec(sql, [req.params.uuid])
  .then(function (data) {
    res.status(200).json(data);
  })
  .catch(next)
  .done();
};


/**
 * GET /locations/detail/:uuid
 *
 * This method looks up a detailed location reference from the database and
 * returns it as a JSON object.
 *
 * @method detail
 * @return {object} JSON object with keys {villageUuid, village, sectorUuid,
 * sector, countryUuid, country}
 */
exports.detail = function detail(req, res, next) {
  'use strict';

  var sql =
    'SELECT village.uuid AS villageUuid, village.name AS village, sector.name AS sector,' +
      'sector.uuid AS sectorUuid, province.name AS province, province.uuid AS provinceUuid, ' +
      'country.country_en AS country, country.uuid AS countryUuid ' +
    'FROM village, sector, province, country ' +
    'WHERE village.sector_uuid = sector.uuid AND ' +
      'sector.province_uuid = province.uuid AND ' +
      'province.country_uuid = country.uuid AND village.uuid = ?;';

  db.exec(sql, [ req.params.uuid ])
  .then(function (rows) {
    if (rows.length === 0) {
      throw new res.codes.ERR_NOT_FOUND();
    }

    res.status(200).json(rows[0]);
  })
  .catch(next)
  .done();
};
