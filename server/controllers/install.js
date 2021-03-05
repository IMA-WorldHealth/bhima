/**
 * @overview Install
 *
 * @description
 * This module is responsible for setting up a new bhima instance
 * by configuring administrator user, enterprise, project, etc.
 *
 * @requires q
 * @requires lib/db
 * @requires lib/errors/BadRequest
 */

const db = require('../lib/db');
const BadRequest = require('../lib/errors/BadRequest');

/**
 * @const DEFAULTS
 *
 * @description
 * The default values for users, enterprises, and projects.
 */
const DEFAULTS = {
  user : { id : 1, display_name : 'System Administrator' },
  enterprise : { id : 1 },
  project : { id : 1, locked : 0, enterprise_id : 1 },
  settings : { enterprise_id : 1 },
};

/**
 * @method basicInstallExist
 *
 * @description
 * Checks if the basic information for installation exist, in the case
 * it doesn't exist we can perform a new installation
 */
function basicInstallExist() {
  // check users, enterprise, projects
  const userExist = 'SELECT COUNT(*) >= 1 AS has_users FROM user;';
  const enterpriseExist = 'SELECT COUNT(*) >= 1 AS has_enterprises FROM enterprise;';
  const projectExist = 'SELECT COUNT(*) >= 1 AS has_projects FROM project;';

  const dbPromise = [db.one(userExist), db.one(enterpriseExist), db.one(projectExist)];

  return Promise.all(dbPromise)
    .then(([users, enterprises, projects]) => {
      return !!(users.has_users || enterprises.has_enterprises || projects.has_projects);
    });
}

/**
 * GET /install
 *
 * @function checkBasicInstallExist
 *
 * @description
 * Exposes the checkBasicInstallExist method to the API
 */
exports.checkBasicInstallExist = async (req, res, next) => {
  try {
    const isInstalled = await basicInstallExist();
    res.status(200).json({ isInstalled });
  } catch (e) {
    next(e);
  }
};

/**
 * @function defaultEnterpriseLocation
 *
 * @description
 * Grabs the first village in the database as the default enterprise location.
 */
function defaultEnterpriseLocation() {
  return db.one(`SELECT uuid FROM village LIMIT 1;`);
}

/**
 * POST /install
 *
 * @function proceedInstall
 *
 * @description
 * Proceed to the application installation
 */
exports.proceedInstall = async (req, res, next) => {
  const { enterprise, project, user } = req.body;

  try {
    const isInstalled = await basicInstallExist();

    if (isInstalled) {
      throw new BadRequest('The application is already installed');
    }

    const location = await defaultEnterpriseLocation();
    await createEnterpriseProjectUser(enterprise, project, user, location.uuid);
    res.redirect('/');
  } catch (e) {
    next(e);
  }
};

/**
 * @function createEnterpriseProjectUser
 *
 * @description
 * Creates the basic components of the installation: the enterprise, a default project,
 * and the user with superuser permissions.
 */
function createEnterpriseProjectUser(enterprise, project, user, locationUuid) {

  // assign default properties
  Object.assign(user, DEFAULTS.user);
  Object.assign(enterprise, DEFAULTS.enterprise, { location_id : locationUuid });
  Object.assign(project, DEFAULTS.project);

  if (user.repassword) {
    delete user.repassword;
  }

  // prepare transactions
  const sqlEnterprise = 'INSERT INTO enterprise SET ? ';
  const sqlEnterpriseSettings = 'INSERT INTO enterprise_setting SET ?';
  const sqlProject = 'INSERT INTO project SET ? ';
  const sqlUser = 'INSERT INTO user (username, password, display_name) VALUES (?, MYSQL5_PASSWORD(?)  , ?);';

  const sqlRole = `CALL superUserRole(${user.id})`;

  const sqlProjectPermission = 'INSERT INTO project_permission SET ? ';

  return db.transaction()
    .addQuery(sqlEnterprise, enterprise)
    .addQuery(sqlEnterpriseSettings, DEFAULTS.settings)
    .addQuery(sqlProject, project)
    .addQuery(sqlUser, [user.username, user.password, user.display_name])
    .addQuery(sqlProjectPermission, { user_id : user.id, project_id : project.id })
    .addQuery(sqlRole)
    .execute();
}
