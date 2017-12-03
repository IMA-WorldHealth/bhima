/**
 * @overview Install
 *
 * @description
 * This module is responsible for setting up a new bhima instance
 * by configuring administrator user, enterprise, project, etc.
 *
 * @requires db
 */

const Q = require('q');
const db = require('../lib/db');
const BadRequest = require('../lib/errors/BadRequest');

/**
 * @method basicInstallExist
 *
 * @description
 * check if the basic information for installation exist, in the case
 * it doesn't exist we can perform a new installation
 */
function basicInstallExist() {
  // check users, enterprise, projects
  const userExist = 'SELECT COUNT(*) >= 1 AS has_users FROM user;';
  const enterpriseExist = 'SELECT COUNT(*) >= 1 AS has_enterprises FROM enterprise;';
  const projectExist = 'SELECT COUNT(*) >= 1 AS has_projects FROM project;';

  const dbPromise = [db.one(userExist), db.one(enterpriseExist), db.one(projectExist)];

  return Q.all(dbPromise)
    .spread((users, enterprises, projects) => {
      return !!(users.has_users || enterprises.has_enterprises || projects.has_projects);
    });
}

/**
 * GET /install
 *
 * expose the checkBasicInstallExist method to the API
 */
exports.checkBasicInstallExist = (req, res, next) => {
  basicInstallExist()
    .then(isInstalled => res.status(200).json({ isInstalled }))
    .catch(next)
    .done();
};

/**
 * POST /install
 *
 * proceed to the application installation
 */
exports.proceedInstall = (req, res, next) => {
  const { enterprise, project, user } = req.body;

  basicInstallExist()
    .then(isInstalled => {
      if (isInstalled) { throw new BadRequest('The application is already installed'); }

      return defaultEnterpriseLocation();
    })
    .then((location) => createEnterpriseProjectUser(enterprise, project, user, location.uuid))
    .then(() => res.redirect('/'))
    .catch(next)
    .done();

  /**
   * default location for enterprise
   */
  function defaultEnterpriseLocation() {
    const sql = `SELECT uuid FROM village LIMIT 1;`;
    return db.one(sql);
  }

  /**
   * create enterprise, project and user
   */
  function createEnterpriseProjectUser(_enterprise, _project, _user, locationUuid) {
    // set primary key and defaults
    const USER_ID = 1;
    const PROJECT_ID = 1;
    const ENTERPRISE_ID = 1;

    // user default
    _user.id = USER_ID;
    _user.display_name = 'System Administrator';

    // enterprise default
    _enterprise.id = ENTERPRISE_ID;
    _enterprise.location_id = locationUuid;

    // project default
    _project.id = PROJECT_ID;
    _project.enterprise_id = ENTERPRISE_ID;
    _project.locked = 0;

    if (_user.repassword) {
      delete _user.repassword;
    }

    // prepare transactions
    const transaction = db.transaction();
    const sqlEnterprise = 'INSERT INTO enterprise SET ? ';
    const sqlProject = 'INSERT INTO project SET ? ';
    const sqlUser = `
      INSERT INTO user (username, password, display_name) VALUES (?, PASSWORD(?), ?);`;

    const sqlUnitPermission = `
      INSERT INTO permission (unit_id, user_id)
      SELECT unit.id, ${USER_ID} FROM unit
      ON DUPLICATE KEY UPDATE unit_id = unit_id, user_id = user_id`;

    const sqlProjectPermission = 'INSERT INTO project_permission SET ? ';

    transaction.addQuery(sqlEnterprise, _enterprise);
    transaction.addQuery(sqlProject, _project);
    transaction.addQuery(sqlUser, [_user.username, _user.password, _user.display_name]);
    transaction.addQuery(sqlUnitPermission);
    transaction.addQuery(sqlProjectPermission, { user_id : USER_ID, project_id : PROJECT_ID });

    return transaction.execute();
  }
};
