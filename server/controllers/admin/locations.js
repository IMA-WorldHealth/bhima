/**
 * The Location API
 *
 * routes:
 *
 *   /locations/types
 *   /locations/detail/:uuid
 *
 * Each endpoint returns a table with all information available.
 * Endpoints taking UUIDs return only the records matching the UUID
 */

const { uuid } = require('../../lib/util');
const db = require('../../lib/db');
const Unauthorized = require('../../lib/errors/Unauthorized');

exports.getLocations = getLocations;
exports.buildPath = buildPath;
exports.dynamiqueLocationJoin = dynamiqueLocationJoin;
exports.getDeepness = getDeepness;
exports.lookupConfiguration = lookupConfiguration;

/**
 * GET /locations/readLocations
 *
 * This method lists all locations configured in the database.
 *
 * @method readLocations
 * @return {array}
 */
exports.readLocations = function readLocations(req, res, next) {
  getLocations()
    .then((data) => {

      res.status(200).json(data);
    })
    .catch(next)
    .done();
};

function getLocations() {
  const sql = `
    SELECT l.id, BUID(l.uuid) location_uuid, l.name, BUID(l.parent_uuid) AS parent_uuid,
    l.parent, l.location_type_id, l.longitude, l.latitude, t.translation_key, t.color, t.label_name
    FROM location AS l
    JOIN location_type AS t ON t.id = l.location_type_id
    ORDER BY l.name ASC;`;

  return db.exec(sql);
}

/*
 * This function makes it possible to obtain the degree of depth existing in
 * the tree structure of locations, excluding the types
 * that have no children in the configuration
 */
function getDeepness() {
  const sql = `
    SELECT COUNT(DISTINCT(l.location_type_id)) AS location_level_deepness
    FROM location AS l
    WHERE l.id IN (SELECT parent FROM location);
  `;

  return db.one(sql);
}

function buildPath(locations, locationId, root) {
  let path = ``;
  if (locations.path === 0) { return null; }
  recursiveParent(locations, locationId);

  function recursiveParent(data, id) {
    const node = data.filter(d => d.id === id);
    // if (node[0].parent !== 0) {

    if (root) {
      const temp = `/ ${node[0].name}`;
      path = `${temp}${path}`;
    } else if (node[0].parent !== 0) {
      const temp = `/ ${node[0].name}`;
      path = `${temp}${path}`;
    }

    if (node[0].parent && node[0].parent !== 0) {
      recursiveParent(data, node[0].parent);
    }
  }

  return path;
}

function dynamiqueLocationJoin(deepLevel, params) {
  let sqlHeader = ``;
  let sqlJoin = ``;
  let whereCondition = ``;

  for (let i = 1; i <= deepLevel; i++) {
    sqlHeader += `
      l${i}.id AS location_id_${i}, l${i}.name AS name_${i}, l${i}.location_type_id AS location_type_id_${i},
      t${i}.translation_key AS translation_key_${i}, t${i}.color AS color_${i},
      `;

    const joinCondition = (i === 1) ? `loc` : `l${i - 1}`;

    sqlJoin += `
      LEFT JOIN location AS l${i} ON l${i}.id = ${joinCondition}.parent
      LEFT JOIN location_type AS t${i} ON t${i}.id = l${i}.location_type_id`;
  }

  if (params.is_leave === 'true') {
    whereCondition = `WHERE loc.id IN (
      SELECT l.id
      FROM location AS l
      JOIN location_type AS t ON t.id = l.location_type_id
      WHERE t.is_leaves = 1 OR  l.id NOT IN (SELECT parent FROM location))`;
  }

  const getLocationsDeepness = `
    SELECT loc.id, loc.name, loc.parent, loc.location_type_id, loc.translation_key, loc.color, loc.label_name, 
    ${sqlHeader} loc.is_leaves
    FROM (
      SELECT l.id, l.name, l.parent, l.location_type_id, t.translation_key, t.color, t.label_name, t.is_leaves
      FROM location AS l
      JOIN location_type AS t ON t.id = l.location_type_id
      ORDER BY l.name ASC
    ) AS loc ${sqlJoin}
    ${whereCondition}
    ORDER BY loc.name ASC
  `;

  const getTypes = sqlLocationType(params);

  return Promise.all([db.exec(getTypes), db.exec(getLocationsDeepness)])
    .then(([types, locationsDeep]) => {

      const columns = [];
      const data = [];

      types.forEach(type => {
        columns.push({
          field : `${type.label_name}_name`,
          displayName : type.translation_key,
          headerCellFilter : 'translate',
        });
      });

      locationsDeep.forEach(location => {
        const element = {
          id : location.id,
          name : location.name,
          parent : location.parent,
          location_type_id : location.location_type_id,
          translation_key : location.translation_key,
          color : location.color,
        };

        types.forEach(type => {

          for (let i = 1; i <= deepLevel; i++) {
            if (type.id === location[`location_type_id_${i}`]) {
              element[`${type.label_name}_id`] = location[`location_id_${i}`];
              element[`${type.label_name}_name`] = location[`name_${i}`];
            }
          }
        });

        data.push(element);
      });

      const locations = {
        data,
        columns,
        types,
      };

      return locations;
    });
}

/**
 * GET /locations/types
 *
 * This method lists all locations types in the database.
 *
 * @method types
 * @return {array} an array of (uuid, name)
 */
exports.types = function types(req, res, next) {
  let options = {};

  if (req.query.excludeType) {
    options = {
      defaultType : req.session.enterprise.location_default_type_root,
      excludeType : req.query.excludeType,
    };
  }

  const sql = sqlLocationType(options);

  db.exec(sql)
    .then((data) => {
      res.status(200).json(data);
    })
    .catch(next)
    .done();
};

function sqlLocationType(params) {
  let condition = ``;
  if (params) {
    if (params.is_leave === 'true') {
      condition = `
      WHERE id IN (SELECT DISTINCT(location.location_type_id) AS location_type_id FROM location)`;
    }

    if (params.excludeType) {
      condition = `
      WHERE (id <> ${params.excludeType} AND id <> ${params.defaultType})`;
    }
  }

  return `
    SELECT id, translation_key, label_name, color, fixed, is_leaves
    FROM location_type ${condition}
    ORDER BY label_name ASC`;
}

/**
 * GET /locations/root
 *
 * This method all root locations.
 *
 * @method root
 * @return {array} an array of (uuid, name)
 */
exports.root = function root(req, res, next) {
  const { locationId } = req.query;

  // is null if the ALLR option is enabled if not, the default type is enabled
  const locationTypeRoot = (req.query.allRoot === 'true') ? null : req.session.enterprise.location_default_type_root;

  let clauseWhere;
  let deepLevel = 0;

  const excludeTypeId = req.query.excludeType ? `AND l.location_type_id <> ${req.query.excludeType}` : '';

  // Here we try to create the Sql request dynamically with respect to the parameters sent
  if (!req.query.parentId) {
    clauseWhere = locationTypeRoot ? `WHERE l.location_type_id = ${locationTypeRoot} ${excludeTypeId}`
      : `WHERE l.parent = 0 AND l.parent_uuid IS NULL ${excludeTypeId}`;
  } else {
    clauseWhere = `WHERE l.parent = ${req.query.parentId} ${excludeTypeId}`;
  }

  getDeepness()
    .then((deep) => {
      deepLevel = deep.location_level_deepness;

      // This query allows you to obtain the parent locations
      const sql = `
        SELECT l.id, BUID(l.uuid) AS uuid, l.name, l.parent, BUID(l.parent_uuid) AS parent_uuid,
        l.location_type_id, t.translation_key, t.color, t.label_name
        FROM location AS l
        JOIN location_type AS t ON t.id = l.location_type_id ${clauseWhere} ORDER BY l.name ASC;`;

      // This query allows to obtain the different types corresponding to the above locations.
      const sqlAggregat = `
        SELECT DISTINCT(t.id) AS id, t.translation_key, t.color, t.label_name
        FROM location_type AS t
        JOIN location AS l ON l.location_type_id = t.id
        ${clauseWhere}
        ORDER BY l.name ASC;`;

      let sqlHeader = ``;
      let sqlJoin = ``;

      // Here we try to add indices for each level of localization the indices start from 1 
      // for the root up to the size of the depth in the tree structure

      for (let i = 1; i <= deepLevel; i++) {
        sqlHeader += `
          l${i}.id AS location_id_${i}, l${i}.name AS name_${i}, l${i}.location_type_id AS location_type_id_${i},
          t${i}.translation_key AS translation_key_${i}, t${i}.color AS color_${i},
          `;

        const joinCondition = (i === 1) ? `loc` : `l${i - 1}`;

        sqlJoin += `
          LEFT JOIN location AS l${i} ON l${i}.id = ${joinCondition}.parent
          LEFT JOIN location_type AS t${i} ON t${i}.id = l${i}.location_type_id`;
      }

      const deepnessCondition = locationId ? `WHERE l.id = ${locationId}` : ``;

      /*
       * The following query makes it possible to join all the locations,
       * with respect to their parents and according to the depth of the locations
       *
       * And if the locationId parameter is defined the results will only be defined in relation to the parameters
       */
      const getLocationsDeepness = `
        SELECT loc.id, loc.name, loc.parent, loc.location_type_id, loc.translation_key, loc.label_name, 
        ${sqlHeader} loc.is_leaves
        FROM (
          SELECT l.id, l.name, l.parent, l.location_type_id, t.translation_key, t.label_name, t.is_leaves
          FROM location AS l
          JOIN location_type AS t ON t.id = l.location_type_id
          ${deepnessCondition}
          ORDER BY l.name ASC
        ) AS loc ${sqlJoin}
      `;

      /*
        * The query to generate looks like this
        *
        * SELECT loc.id, loc.name, loc.parent, loc.location_type_id, loc.translation_key, loc.label_name,

            l1.id AS location_id_1, l1.name AS name_1, l1.location_type_id AS location_type_id_1,
            t1.translation_key AS translation_key_1, t1.color AS color_1,

            l2.id AS location_id_2, l2.name AS name_2, l2.location_type_id AS location_type_id_2,
            t2.translation_key AS translation_key_2, t2.color AS color_2,

            l3.id AS location_id_3, l3.name AS name_3, l3.location_type_id AS location_type_id_3,
            t3.translation_key AS translation_key_3, t3.color AS color_3,

            l4.id AS location_id_4, l4.name AS name_4, l4.location_type_id AS location_type_id_4,
            t4.translation_key AS translation_key_4, t4.color AS color_4,
            loc.is_leaves
          FROM (
            SELECT l.id, l.name, l.parent, l.location_type_id, t.translation_key, t.label_name, t.is_leaves
            FROM location AS l
            JOIN location_type AS t ON t.id = l.location_type_id

            ORDER BY l.name ASC
          ) AS loc
          LEFT JOIN location AS l1 ON l1.id = loc.parent
          LEFT JOIN location_type AS t1 ON t1.id = l1.location_type_id
          LEFT JOIN location AS l2 ON l2.id = l1.parent
          LEFT JOIN location_type AS t2 ON t2.id = l2.location_type_id
          LEFT JOIN location AS l3 ON l3.id = l2.parent
          LEFT JOIN location_type AS t3 ON t3.id = l3.location_type_id
          LEFT JOIN location AS l4 ON l4.id = l3.parent
          LEFT JOIN location_type AS t4 ON t4.id = l4.location_type_id
      */

      return Promise.all([db.exec(sql), db.exec(sqlAggregat), db.exec(getLocationsDeepness)]);
    })
    .then(([rows, aggregates, locationsDeep]) => {
      const data = {
        rows,
        aggregates,
        locationsDeep,
        deepLevel,
      };

      res.status(200).json(data);
    })
    .catch(next);

};

function lookupType(typeId) {

  const sql = `SELECT id, translation_key, color, fixed, is_leaves, label_name
    FROM location_type WHERE id = ?;`;

  return db.one(sql, [typeId]);
}

function lookupConfiguration(locationId) {
  const sql = `
    SELECT l.id, BUID(l.uuid) AS uuid, l.name, l.parent,
    BUID(l.parent_uuid) AS parent_uuid, l.location_type_id, l.longitude, l.latitude,
    t.translation_key, t.label_name, t.color
    FROM location AS l
    JOIN location_type AS t ON t.id = l.location_type_id
    WHERE l.id = ?;`;

  return db.one(sql, [locationId]);
}

/**
 * GET /locations/detail/
 *
 * This method looks up a detailed location reference from the database and
 * returns it as a JSON object.
 *
 * @method detail
 * @return {object} JSON object with keys {...}
 */
exports.list = function list(req, res, next) {
  const params = req.query;

  getDeepness()
    .then((deep) => {
      const deepLevel = deep.location_level_deepness;

      return dynamiqueLocationJoin(deepLevel, params);
    })
    .then((locations) => {
      res.status(200).json(locations);
    })
    .catch(next);
};

/**
* GET //locations/readLocations/:id
*
* Returns the detail of a single location
*/
exports.locationDetail = function locationDetail(req, res, next) {
  const { id } = req.params;

  lookupConfiguration(id)
    .then((record) => {
      res.status(200).json(record);
    })
    .catch(next)
    .done();
};

/** bindings for creation methods */
exports.create = {};

/**
 * POST /locations/type
 *
 * This method creates a location type reference in the database and returns its id.
 *
 * @method createType
 * @returns {string} id - the unique id for the type.
 */
exports.create.type = function type(req, res, next) {
  const data = req.body;

  const sql = `INSERT INTO location_type SET ?;`;

  db.exec(sql, [data])
    .then(rows => {
      res.status(201).json({ id : rows.insertId });
    })
    .catch(next)
    .done();
};

/**
 * POST /locations/configuration
 *
 * This method add location in configuration on database and returns its id and uuid.
 *
 * @method createConfiguration
 * @returns {string} uuid - the unique id for the location.
 */
exports.create.configuration = function createConfiguration(req, res, next) {
  // create a UUID if not provided
  const data = req.body;
  data.uuid = req.body.uuid || uuid();

  const locationUuid = req.body.uuid;

  data.uuid = db.bid(data.uuid);

  if (data.parent_uuid) {
    data.parent_uuid = db.bid(data.parent_uuid);
  }

  const sql = `INSERT INTO location SET ?;`;

  db.exec(sql, [data])
    .then(rows => {
      res.status(201).json({ id : rows.insertId, uuid : locationUuid });
    })
    .catch(next)
    .done();
};

/** bindings for update methods */
exports.update = {};

/**
 * PUT /locations/types/:id
 *
 * This method update a location types in the database.
 *
 * @method updateType
 */
exports.update.type = function updateType(req, res, next) {
  const typeId = req.params.id;
  const data = req.body;

  const sql = 'UPDATE location_type SET ? WHERE id = ?;';

  db.exec(sql, [data, typeId])
    .then(() => {
      return lookupType(typeId);
    })
    .then((record) => {
      res.status(200).json(record);
    })
    .catch(next)
    .done();
};

/**
 * PUT /locations/configurations/:id
 *
 * This method update a location configurations in the database.
 *
 * @method updateConfiguration
 */
exports.update.configuration = function updateConfiguration(req, res, next) {
  const locationId = req.params.id;
  const data = req.body;

  delete data.translation_key;
  delete data.color;

  if (data.uuid) {
    data.uuid = db.bid(data.uuid);
  }

  if (data.parent_uuid) {
    data.parent_uuid = db.bid(data.parent_uuid);
  }

  const sql = 'UPDATE location SET ? WHERE id = ?;';

  db.exec(sql, [data, locationId])
    .then(() => {
      return lookupConfiguration(locationId);
    })
    .then((record) => {
      res.status(200).json(record);
    })
    .catch(next)
    .done();
};

exports.delete = {};

exports.delete.type = (req, res, next) => {
  const sql = 'DELETE FROM location_type WHERE id=?';

  db.exec(sql, req.params.id).then(() => {
    res.sendStatus(204);
  }).catch(next);
};

exports.delete.configuration = (req, res, next) => {
  const locationId = req.params.id;

  const checkChildren = `
    SELECT count(location.id) AS countLocation FROM location WHERE location.parent = ?;`;

  db.one(checkChildren, [locationId])
    .then((data) => {

      if (data.countLocation > 0) {
        throw new Unauthorized('This location is Parent in Location management', 'ERRORS.UNABLE_DELETE_LOCATION');
      }

      const sql = 'DELETE FROM location WHERE id=?';

      return db.exec(sql, locationId);
    })
    .then(() => {
      res.sendStatus(204);
    }).catch(next);
};

exports.merge = (req, res, next) => {
  const { selected, other } = req.body;

  const transaction = db.transaction();

  const replaceLocationParent = `
    UPDATE location SET parent = ?, parent_uuid = ? 
    WHERE parent = ? AND parent_uuid = ?;`;

  // debtor_group
  const replaceLocationInDebtorGroup = `
    UPDATE debtor_group SET location_uuid = ? WHERE location_uuid = ?;`;

  // enterprise
  const replaceLocationInEnterprise = `
    UPDATE enterprise SET location_uuid = ? WHERE location_uuid = ?;`;

  // Patient
  const replaceLocationInPatient1 = `
    UPDATE patient SET current_location_id = ? WHERE current_location_id = ?;`;

  const replaceLocationInPatient2 = `
    UPDATE patient SET origin_location_id = ? WHERE origin_location_id = ?;`;

  const removeOtherLocation = `  
    DELETE FROM location WHERE id = ?;`;

  transaction
    .addQuery(replaceLocationParent, [selected.id, db.bid(selected.uuid), other.id, db.bid(other.uuid)])
    .addQuery(replaceLocationInDebtorGroup, [db.bid(selected.uuid), db.bid(other.uuid)])
    .addQuery(replaceLocationInEnterprise, [db.bid(selected.uuid), db.bid(other.uuid)])
    .addQuery(replaceLocationInPatient1, [db.bid(selected.uuid), db.bid(other.uuid)])
    .addQuery(replaceLocationInPatient2, [db.bid(selected.uuid), db.bid(other.uuid)])
    .addQuery(removeOtherLocation, [other.id]);

  transaction.execute().then(() => {
    res.sendStatus(200);
  }).catch(next);
};
